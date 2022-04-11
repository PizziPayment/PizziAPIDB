import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Client from './clients.database.model'
import Credential from './credentials.database.model'

interface TokenAttributes {
  id: number
  access_token: string
  refresh_token: string
  expires_at: Date
  client_id: number
  credential_id: number
}

export type TokenCreation = Omit<TokenAttributes, 'id'>

@Table({ tableName: 'tokens', timestamps: false })
export default class Token extends Model<TokenAttributes, TokenCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column({ allowNull: false })
  access_token!: string

  @Column({ allowNull: false })
  refresh_token!: string

  @Column({ allowNull: false, type: DataType.DATE })
  expires_at!: Date

  @ForeignKey(() => Client)
  @Column({ allowNull: false })
  client_id!: number

  @ForeignKey(() => Credential)
  @Column({ allowNull: false })
  credential_id!: number
}
