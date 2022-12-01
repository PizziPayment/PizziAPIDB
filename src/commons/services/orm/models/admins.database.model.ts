import { AutoIncrement, Column, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Credential from './credentials.database.model'

@Table({ tableName: 'admins', timestamps: false })
export default class Admin extends Model<Admin> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @HasOne(() => Credential)
  credential!: Credential
}
