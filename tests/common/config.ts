// @ts-ignore
import ConfigProvider from 'config'
import { OrmConfig } from '../../src/commons/models/orm.config.model'

export const config: OrmConfig = {
  host: ConfigProvider.get('host'),
  port: ConfigProvider.get('port'),
  name: ConfigProvider.get('name'),
  user: ConfigProvider.get('user'),
  password: ConfigProvider.get('password'),
  logging: false,
}
