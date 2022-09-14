import { AutoIncrement, Column, Model, PrimaryKey, Table, DataType } from 'sequelize-typescript'

interface ImageAttributes {
  id: number
  buffer: Buffer
}

export type ImageCreation = Omit<ImageAttributes, 'id'>

@Table({ tableName: 'images' })
export default class Image extends Model<ImageAttributes, ImageCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column({ type: DataType.BLOB, allowNull: false })
  buffer!: Buffer
}
