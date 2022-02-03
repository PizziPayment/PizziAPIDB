import { PaymentMethod, TransactionState } from '../../commons/services/orm/models/transactions.database.model'

export interface TransactionModel {
  id: number
  state: TransactionState
  payment_method: PaymentMethod
  user_id?: number
  shop_id: number
  receipt_id: number
}
