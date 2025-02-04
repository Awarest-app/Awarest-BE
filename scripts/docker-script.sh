#!/bin/sh

DOCKER_IMAGE_NAME=my-nest-app

DOCKER_CONTAINER_NAME=nest-app

docker build -t ${DOCKER_IMAGE_NAME} . # <--- 프로젝트 루트 경로에 대한 상대경로

docker run -d -p 3001:3000 --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_NAME}

#!/bin/bash

# mkdir -p /home/ec2-user/deploy/zip
# cd /home/ec2-user/deploy/zip/

# docker-compose down

# aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 229262694893.dkr.ecr.us-east-1.amazonaws.com
# docker-compose pull

# docker-compose up -d