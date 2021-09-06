import OrmConfig from './commons/models/orm.config.model'
import { Sequelize } from 'sequelize-typescript'

// This function must be called before accessing other members
// if not, it will probably throw an error when using sequelize's
// models.
export async function initOrm(config: OrmConfig): Promise<void> {
  return new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    models: [`${__dirname}/commons/services/orm/models/`],
    logging: config.logging,
  }).authenticate()
}
