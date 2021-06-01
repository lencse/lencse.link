.PHONY:
	init_dev
	dev
	migrate
	migrate_reset
	seed
	sql
	sh
	check_dotenv dev_db wait_for_db check_dev_log_size generate_seed_data

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

BIN=node_modules/.bin
DEV_DB_NAME=lnk_postgres
TSC=$(BIN)/tsc -p . --outDir ./build --pretty --watch --preserveWatchOutput

node_modules: package.json yarn.lock
	yarn && touch node_modules

admin/node_modules: admin/package.json admin/yarn.lock
	cd admin; yarn && touch node_modules

main/node_modules: main/package.json main/yarn.lock
	cd main; yarn && touch node_modules

db/node_modules: db/package.json db/yarn.lock
	cd db; yarn && touch node_modules

logs:
	mkdir -p logs

.env:
	cp .env.example .env

init_dev: .env

dev: node_modules admin/node_modules main/node_modules db/node_modules logs
	make check_dotenv
	make check_dev_log_size
	$(BIN)/concurrently \
		-n db,admin,admin-ts,main,main-ts \
		-c bgYellow,bgBlue,bgCyan,bgMagenta,bgWhite \
		"make dev_db 2>&1 | tee -a logs/db.log" \
		"(make wait_for_db && make migrate && (cd admin ; ${BIN}/next dev -p ${ADMIN_PORT})) 2>&1 | tee -a logs/admin.log" \
		"(cd admin ; ${TSC}) 2>&1 | tee -a logs/admin-ts.log" \
		"(make wait_for_db && (cd main ; PORT=${MAIN_PORT} $(BIN)/nodemon server.js)) 2>&1 | tee -a logs/main.log" \
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

seed:
	make migrate_reset
	make migrate
	cd admin ; make .seed.json
	cd admin ; bin/save-seed

generate_seed_data:
	admin/bin/generate-seed-data

check_dev_log_size: logs node_modules
	bin/check-log-size

check_dotenv: node_modules
	bin/check-dotenv

sh:
	sh
