.PHONY:
	wait_for_db
	migrate
	migrate_reset
	docker

default: node_modules

node_modules: package.json yarn.lock
	yarn && touch node_modules

migrate: node_modules
	node_modules/.bin/db-migrate up

migrate_reset: node_modules
	`yarn bin`/db-migrate reset

wait_for_db: node_modules
	bin/wait-for-db

docker:
	docker build -t lencse/test-lencse-link-migration --no-cache --progress plain .
