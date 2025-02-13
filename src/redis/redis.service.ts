// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClient;

  onModuleInit() {
    // 실제 Redis 서버와 연결
    this.client = new Redis({
      host: process.env.REDIS_HOST, // docker-compose 기준 'redis'를 호스트로
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD, // 필요하다면 추가
    });
  }

  // 다른 서비스에서 Redis 인스턴스를 얻을 수 있는 메서드
  getClient(): RedisClient {
    return this.client;
  }

  onModuleDestroy() {
    // 애플리케이션 종료 시점에 연결 종료
    this.client.quit();
  }
}
