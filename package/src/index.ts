import { createHash } from 'crypto'
import { Sequelize } from 'sequelize-typescript'
import ClientsService from './clients/clients.database.service'
import OrmConfig from './commons/models/orm.config.model'
import CredentialsService from './credentials/credentials.database.service'
import TokensService from './tokens/tokens.database.service'

export * from './commons/models/response.model'

export default class PizziDatabaseService {
  // This method has to be called before accessing other members
  // if not, it will probably throw an error when using sequelize's
  // models.
  static initOrm(config: OrmConfig): Promise<void> {
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

  static encrypt(source: string): string {
    return createHash('sha256').update(source).digest('hex')
  }

  static credentials: CredentialsService
  static tokens: TokensService
  static clients: ClientsService
}
