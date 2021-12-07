import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript'

interface PaymentMethodsAttributes {
  id: number
  method: string
}

export type PaymentMethodsCreation = Omit<PaymentMethodsAttributes, 'id'>

@Table({ tableName: 'payment_methods', timestamps: false })
export default class PaymentMethod extends Model<PaymentMethodsAttributes, PaymentMethodsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column
  method!: string
}
