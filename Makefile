# 변수 설정
DOCKER_COMPOSE = docker compose
FILE_ROUTE = -f docker/docker-compose.dev.yml
APP_NAME = nest-app
SQL_FILE=dummy.sql

all: build up

# 기본 명령
up:
	@$(DOCKER_COMPOSE) ${FILE_ROUTE}  --env-file ./config/.env.development up -d
	@echo "Containers are up and running."

re : down down-volumes all

down:
	@$(DOCKER_COMPOSE) ${FILE_ROUTE} down
	@echo "Containers are stopped."

down-volumes:
	@$(DOCKER_COMPOSE) ${FILE_ROUTE} down -v
	@echo "Containers and volumes are removed."

build:
	@$(DOCKER_COMPOSE) ${FILE_ROUTE} build
	@echo "Containers are built."

restart:
	@$(DOCKER_COMPOSE) ${FILE_ROUTE} down
	@$(DOCKER_COMPOSE) ${FILE_ROUTE} up -d
	@echo "Containers have been restarted."



local: local-db local-redis local-server 

local-server:
	npm run start:dev 

local-db:
	@brew services start postgresql

local-db-stop:
	@brew services stop postgresql

local-redis:
	@brew services start redis

# .sql 스크립트 실행
sql: local-db
	@echo "Executing SQL script: $(SQL_FILE)"
	@psql -U postgres -d coura -f $(SQL_FILE)
# @psql -U postgres -d $(DB_NAME) -f $(SQL_FILE)

# local-down:
# 	@brew services stop postgresql
# 	@brew services stop redis

# create-db:
# 	psql -U postgres -c "CREATE DATABASE coura;"

# drop-db:
# 	psql -U postgres -c "DROP DATABASE IF EXISTS coura;"

.PHONY: all up down down-volumes build restart sql

