.PHONY:
	init_dev
	dev
	migrate
	migrate_reset
	seed
	sql
	sh
	node
	docker_build
	docker_run
	verify
	watch_test
	refresh
	check_dotenv dev_db wait_for_db check_dev_log_size generate_seed_data

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

BIN=node_modules/.bin
DEV_DB_NAME=lnk_postgres
TSC=$(BIN)/tsc -p . --outDir ./build --pretty --watch --preserveWatchOutput

node_modules: package.json yarn.lock
	yarn --immutable && touch node_modules

admin/node_modules: admin/package.json admin/yarn.lock
	cd admin; make node_modules

main/node_modules: main/package.json main/yarn.lock
	cd main; make node_modules

db/node_modules: db/package.json db/yarn.lock
	cd db; make node_modules

verify:
	cd admin ; make verify
	cd main ; make verify

watch_test: admin/node_modules main/node_modules db/node_modules
	cd admin ; $(BIN)/jest -c jest.compiled.config.js --verbose --watch

test_compiled: admin/node_modules main/node_modules db/node_modules
	cd admin ; $(BIN)/jest -c jest.compiled.config.js --verbose

logs:
	mkdir -p logs

.env:
	cp .env.example .env

init_dev: .env

dev: node_modules admin/node_modules main/node_modules db/node_modules logs
	make check_dotenv
	make check_dev_log_size
	echo ${DATABASE_URL}
	$(BIN)/concurrently \
		-n db,admin,admin-ts,main,main-ts \
		-c bgYellow,bgBlue,bgCyan,bgMagenta,bgWhite \
		"make dev_db 2>&1 | tee -a logs/db.log" \
		"(make wait_for_db && make migrate && make seed && (cd admin ; ${BIN}/next dev -p ${ADMIN_PORT})) 2>&1 | tee -a logs/admin.log" \
		"(cd admin ; ${TSC}) 2>&1 | tee -a logs/admin-ts.log" \
		"(make wait_for_db && (cd main ; make ;PORT=${MAIN_PORT} $(BIN)/nodemon server.js)) 2>&1 | tee -a logs/main.log" \
		"(cd main ; ${TSC}) 2>&1 | tee -a logs/main-ts.log"

dev_db:
	docker run --rm --name ${DEV_DB_NAME} \
		-v /tmp/${DEV_DB_NAME}:/var/lib/postgresql/data \
		-e POSTGRES_PASSWORD=${DB_PASSWORD} -p ${DB_PORT}:5432 postgres

migrate:
	cd db ; make migrate

migrate_reset:
	cd db ; make migrate_reset

wait_for_db:
	cd db ; make wait_for_db

# Examples:
# 	- make SQL="select * from migrations;" sql
# 	- make sql
sql:
	[ -z "$(SQL)" ] && \
		docker exec -it ${DEV_DB_NAME} psql --username=${DB_USER} || \
		docker exec -it ${DEV_DB_NAME} psql --username=${DB_USER} --command "$(SQL)"

start: node_modules
	cd admin ; make
	cd main ; make
	cd db ; make
	`yarn bin`/concurrently \
		-n admin,main \
		-c bgBlue,bgMagenta \
		"cd admin ; ${BIN}/next start -p ${ADMIN_PORT}" \
		"cd main ; PORT=${MAIN_PORT} node server.js"

seed:
	cd admin ; make seed

smoke_test:
	bin/smoke-test

# bin/smoke-test 2>/dev/null

generate_seed_data:
	admin/bin/generate-seed-data

check_dev_log_size: logs node_modules
	bin/check-log-size

check_dotenv: node_modules
	bin/check-dotenv

sh:
	sh

node:
	node

refresh:
	make migrate_reset
	make migrate
	make generate_seed_data
	make seed

docker_build:
	cd admin ; make docker
	cd main ; make docker
	cd db ; make docker

docker_run:
	( docker kill $(docker ps -q) | :) && sleep 2 && (docker network rm lencse-link-test || :) \
	docker network create lencse-link-test && \
	docker run -d --rm -h db --network=lencse-link-test -e POSTGRES_PASSWORD=postgres postgres:latest && \
	docker run -d --rm -h admin --name lencse-link-admin-running --network=lencse-link-test -p 5201:3000 \
		-e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres -e MAIN_URL=http://localhost:5200 \
		-e MAIN_INTERNAL_URL=http://main_service:3000 \
		-e JWT_SECRET="My baby's got a secret: $(openssl rand -base64 12)" lencse/test-lencse-link-admin && \
	docker run -d --rm -h main_service --network=lencse-link-test -p 5200:3000 \
		-e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres lencse/test-lencse-link-main && \
	docker run --rm --network=lencse-link-test -e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres lencse/test-lencse-link-migration && \
	docker exec -it lencse-link-admin-running bin/save-seed && echo "\nOpen http://localhost:5201\nLogin info: admin@test.link/ALittleDummyPassword"
