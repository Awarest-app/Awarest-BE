# 베이스 이미지 설정
FROM node:18-alpine

# 작업 디렉토리 생성
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 모듈 설치
RUN npm install

# 소스 전체 복사
COPY . .

# NestJS 빌드
RUN npm run build

# 3000 포트 사용
EXPOSE 3000

# 프로덕션 모드 실행
CMD ["npm", "run", "start:prod"]