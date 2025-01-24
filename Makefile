# 변수 설정
DOCKER_COMPOSE = docker compose
APP_NAME = nest-app
DB_NAME = coura-db
SQL_FILE=dummy.sql

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

local: local-db local-server

local-server:
	@ENV_FILE=.local npm run start:dev

local-db:
	@brew services start postgresql

local-db-stop:
	@brew services stop postgresql

# .sql 스크립트 실행
run-sql: local-db
	@echo "Executing SQL script: $(SQL_FILE)"
	@psql -U postgres -d coura -f $(SQL_FILE)
# @psql -U postgres -d $(DB_NAME) -f $(SQL_FILE)


# create-db:
# 	psql -U postgres -c "CREATE DATABASE coura;"

# drop-db:
# 	psql -U postgres -c "DROP DATABASE IF EXISTS coura;"

.PHONY: all up down down-volumes build restart 