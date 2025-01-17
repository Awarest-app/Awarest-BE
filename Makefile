# 변수 설정
DOCKER_COMPOSE = docker compose
APP_NAME = nest-app
DB_NAME = nest-postgres

all: build up

# 기본 명령
up:
	@$(DOCKER_COMPOSE) up -d
	@echo "Containers are up and running."

re : down down-volumes all

down:
	@$(DOCKER_COMPOSE) down
	@echo "Containers are stopped."

down-volumes:
	@$(DOCKER_COMPOSE) down -v
	@echo "Containers and volumes are removed."

build:
	@$(DOCKER_COMPOSE) build
	@echo "Containers are built."

restart:
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE) up -d
	@echo "Containers have been restarted."

logs:
	@$(DOCKER_COMPOSE) logs -f $(APP_NAME)

psql:
	@$(DOCKER_COMPOSE) exec $(DB_NAME) psql -U postgres -d coura

# NestJS 관련 명령어
start:
	@$(DOCKER_COMPOSE) exec $(APP_NAME) npm run start

start-dev:
	@$(DOCKER_COMPOSE) exec $(APP_NAME) npm run start:dev

lint:
	@$(DOCKER_COMPOSE) exec $(APP_NAME) npm run lint

test:
	@$(DOCKER_COMPOSE) exec $(APP_NAME) npm run test