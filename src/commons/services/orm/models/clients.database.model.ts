import { AutoIncrement, Column, Model, HasMany, PrimaryKey, Table } from 'sequelize-typescript'
import Token from './tokens.database.model'

interface ClientAttributes {
  id: number
  client_id: string
  client_secret: string
}

export type ClientCreation = Omit<ClientAttributes, 'id'>

@Table({ tableName: 'clients', timestamps: false })
export default class Client extends Model<ClientAttributes, ClientCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column({ allowNull: false })
  client_id!: string

  @Column({ allowNull: false })
  client_secret!: string

  @HasMany(() => Token, { onDelete: 'CASCADE' })
  tokens!: Array<Token>
}
