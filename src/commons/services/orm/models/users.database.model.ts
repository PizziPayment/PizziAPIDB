import { AutoIncrement, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Credential from './credentials.database.model'
import Image from './images.database.model'
import Transaction from './transactions.database.model'
import SharedReceipt from './shared_receipts.model'

interface UserAttributes {
  id: number
  firstname: string
  surname: string
  picture_id?: number
  address: string
  zipcode: number
  avatar_id?: number
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

  @Column({ allowNull: false })
  address!: string

  @Column({ allowNull: false })
  zipcode!: number

  @HasMany(() => Transaction)
  transactions!: Array<Transaction>

  @HasMany(() => SharedReceipt)
  shared_receipts!: Array<SharedReceipt>

  @HasOne(() => Credential)
  credential!: Credential

  @ForeignKey(() => Image)
  @Column
  avatar_id?: number
}
