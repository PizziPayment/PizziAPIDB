import { OrmConfig } from '../../models/orm.config.model'

export function intoSequelizeOption(config: OrmConfig): any {
  return {
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    models: [`${__dirname}/../../services/orm/models`],
    logging: config.logging,
  }
}
