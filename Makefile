up: docker-dev-up
stop: docker-dev-stop
restart: stop up
logs: docker-dev-logs

docker-dev-up:
	docker compose -f docker-compose.yml up -d

docker-dev-build:
	docker compose -f docker-compose.yml build

docker-dev-stop:
	docker compose -f docker-compose.yml stop

docker-dev-logs:
	docker compose -f docker-compose.yml logs -f