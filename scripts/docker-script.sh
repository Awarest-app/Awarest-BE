#!/bin/bash

# mkdir -p /home/ec2-user/deploy/zip
# cd /home/ec2-user/deploy/zip/

docker-compose -f docker/docker-compose.prod.yml down

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 888577060888.dkr.ecr.us-east-1.amazonaws.com

docker-compose -f docker/docker-compose.prod.yml pull

docker-compose -f docker/docker-compose.prod.yml up -d