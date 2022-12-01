import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Client from './clients.database.model'
import Credential from './credentials.database.model'

interface TokenAttributes {
  id: number
  access_token: string
  access_expires_at: Date
  refresh_token: string
  refresh_expires_at: Date
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

  @Column({ allowNull: false, type: DataType.DATE })
  access_expires_at!: Date

  @Column({ allowNull: false })
  refresh_token!: string

  @Column({ allowNull: false, type: DataType.DATE })
  refresh_expires_at!: Date

  @ForeignKey(() => Client)
  @Column({ allowNull: false })
  client_id!: number

  @ForeignKey(() => Credential)
  @Column({ allowNull: false })
  credential_id!: number

  @BelongsTo(() => Credential, { onDelete: 'CASCADE' })
  credential!: Credential
}
