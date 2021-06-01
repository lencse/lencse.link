# lencse.link

## Try it:

````sh
(docker kill $(docker ps -q) | :) && sleep 2 && (docker network rm lencse-link-test || :) && \
docker network create lencse-link-test && \
docker run -d --rm -h db --network=lencse-link-test -e POSTGRES_PASSWORD=postgres postgres:latest && \
docker run -d --rm -h admin --name lencse-link-admin-running --network=lencse-link-test -p 5201:3000 \
    -e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres -e MAIN_URL=http://localhost:5200 \
    -e MAIN_INTERNAL_URL=http://main_service:3000 -e JWT_SECRET="My baby's got a secret: $(openssl rand -base64 12)" lencse/test-lencse-link-admin && \
docker run -d --rm -h main_service --network=lencse-link-test -p 5200:3000 \
    -e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres lencse/test-lencse-link-main && \
docker run --rm --network=lencse-link-test -e DATABASE_URL=postgres://postgres:postgres@db:5432/postgres lencse/test-lencse-link-migration && \
docker exec -it lencse-link-admin-running bin/save-seed && echo "\nOpen http://localhost:5201\nLogin info: admin@test.link/ALittleDummyPassword"
````
