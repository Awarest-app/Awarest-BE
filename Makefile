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


# create-db:
# 	psql -U postgres -c "CREATE DATABASE coura;"

# drop-db:
# 	psql -U postgres -c "DROP DATABASE IF EXISTS coura;"

.PHONY: all up down down-volumes build restart sql

# # 변수 설정
# DOCKER_COMPOSE = docker compose
# APP_NAME = nest-app
# DB_NAME = coura-db
# SQL_FILE = dummy.sql

# LOCAL_ENV = .local.env
# DOCKER_ENV = .docker.env

# ENV_FILE = .env

# all: ENV_FILE=.docker.env build up

# # 기본 명령
# up:
# 	@ENV_FILE=$(ENV_FILE) $(DOCKER_COMPOSE) up -d
# 	@echo "Containers are up and running."

# re: down down-volumes all

# down:
# 	@ENV_FILE=$(ENV_FILE) $(DOCKER_COMPOSE) down
# 	@echo "Containers are stopped."

# down-volumes:
# 	@ENV_FILE=$(ENV_FILE) $(DOCKER_COMPOSE) down -v
# 	@echo "Containers and volumes are removed."

# build:
# 	@ENV_FILE=$(ENV_FILE) $(DOCKER_COMPOSE) build
# 	@echo "Containers are built."

# restart:
# 	@$(DOCKER_COMPOSE) down
# 	@ENV_FILE=$(ENV_FILE) $(DOCKER_COMPOSE) up -d
# 	@echo "Containers have been restarted."

# # 로컬 실행
# local: ENV_FILE=.local.env local-db local-redis local-server

# # local: ENV_FILE=.local.env
# # 	$(MAKE) local-db ENV_FILE=$(ENV_FILE)
# # 	$(MAKE) local-redis ENV_FILE=$(ENV_FILE)
# # 	$(MAKE) local-server ENV_FILE=$(ENV_FILE)


# local-server:
# 	ENV_FILE=$(DOCKER_ENV) npm run start:dev # ENV_FILE 환경 변수 전달

# local-db:
# 	@brew services start postgresql

# local-db-stop:
# 	@brew services stop postgresql

# local-redis:
# 	@brew services start redis

# # Docker 실행
# docker: ENV_FILE=.docker.env docker-up

# docker-up:
# 	@$(DOCKER_COMPOSE) up -d
# 	@echo "Docker environment started with ENV_FILE=$(ENV_FILE)"

# docker-server:
# 	@$(DOCKER_COMPOSE) exec $(APP_NAME) sh -c "ENV_FILE=$(ENV_FILE) npm run start:prod"

# # .sql 스크립트 실행
# sql: local-db
# 	@echo "Executing SQL script: $(SQL_FILE)"
# 	@psql -U postgres -d coura -f $(SQL_FILE)


