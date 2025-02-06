import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function ormConfig(): TypeOrmModuleOptions {
  const commonConf = {
    // DB 동기화 여부, SYNCHRONIZE은 개발 환경에서만 사용해야 한다.,
    // 실제 서비스 환경에서는 false로 설정해야 한다. -> true이면 객체 변경으로 DB가 변경됨
    SYNCHRONIZE: true,

    // 애플리케이션이 시작될 때, 설정된 마이그레이션이 자동으로 실행
    MIGRATIONS_RUN: true,

    // 이래서 entities경로를 domain으로 설정되어 있던건가..?
    // ENTITIES: [__dirname + '/users/entities/*{.ts,.js}'],
    ENTITIES: [
      __dirname + '/entities/*{.ts,.js}', // entity 폴더 경로
    ],
    MIGRATIONS: [__dirname + '/migrations/**/*{.ts,.js}'],
  };

  return {
    name: 'caura',
    type: 'postgres',
    database: process.env.POSTGRES_DB,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: commonConf.SYNCHRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
    //sql log
    logging: false,
    extra: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // RDS의 경우 자체 서명 인증서를 사용하므로 false로 설정
      },
    },
  };
}

export { ormConfig };
