import { AutoIncrement, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Credential from './credentials.database.model'
import Image from './images.database.model'
import Picture from './pictures.database.model'
import Transaction from './transactions.database.model'

interface UserAttributes {
  id: number
  firstname: string
  surname: string
  picture_id?: number
  address: string
  zipcode: number
}

export type UserCreation = Omit<UserAttributes, 'id'>

@Table({ tableName: 'users', timestamps: false })
export default class User extends Model<UserAttributes, UserCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column({ allowNull: false })
  firstname!: string

  @Column({ allowNull: false })
  surname!: string

  @ForeignKey(() => Picture)
  @Column
  picture_id?: number

  @Column({ allowNull: false })
  address!: string

  @Column({ allowNull: false })
  zipcode!: number

  @HasMany(() => Transaction)
  transactions!: Array<Transaction>

  @HasOne(() => Credential)
  credential!: Credential

  @ForeignKey(() => Image)
  @Column
  avatar_id!: number
}
