import { OrmConfig } from './commons/models/orm.config.model'
import { Sequelize } from 'sequelize-typescript'

// This function must be called before accessing other members
// if not, it will probably throw an error when using sequelize's
// models.
// The initialised Sequelize object is returned.
export async function initOrm(config: OrmConfig): Promise<Sequelize> {
   const sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    models: [`${__dirname}/commons/services/orm/models/`],
    logging: config.logging,
  })

  await sequelize.authenticate()
  return sequelize
}

// This function alter all the database's tables using the database
// models.
// Alteration of existing tables can cause data losses.
export async function alterTables(config: OrmConfig): Promise<Sequelize> {
  return new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    models: [`${__dirname}/commons/services/orm/models/`],
    logging: config.logging,
  }).sync({ alter: true })
}

// This function delete and re create all the database's tables using
// the database models.
// The data stored in the database will be lost.
export async function rewriteTables(config: OrmConfig): Promise<Sequelize> {
  return new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    models: [`${__dirname}/commons/services/orm/models/`],
    logging: config.logging,
  }).sync({ force: true })
}