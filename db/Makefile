.PHONY:
	wait_for_db
	migrate
	migrate_reset
	docker

BIN=node_modules/.bin

node_modules: package.json yarn.lock
	yarn && touch node_modules

migrate: node_modules
	${BIN}/db-migrate up

migrate_reset: node_modules
	${BIN}/db-migrate reset

wait_for_db: node_modules
	bin/wait-for-db

docker:
	docker build -t lencse/test-lencse-link-migration --no-cache --progress plain .
