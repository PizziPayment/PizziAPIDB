import { OrmConfig } from '../../models/orm.config.model'

// An attribute defined as `BIGINT` will be treated like a `string`
// due a feature from node-postgres to prevent precision loss.
// In this project, `BIGINT` is only used for SIRET number in Shops.
// According to French spec, SIRET is only 14 numbers length.
// This allows to deserialize `BIGINT` as JS `number`.
require('pg').defaults.parseInt8 = true

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
