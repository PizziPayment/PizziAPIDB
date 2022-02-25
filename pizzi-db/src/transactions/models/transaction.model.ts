import {
  PaymentMethod,
  TransactionState,
  TransactionAttributes,
} from '../../commons/services/orm/models/transactions.database.model'

export interface TransactionModel {
  id: number
  state: TransactionState
  payment_method: PaymentMethod
  user_id?: number
  shop_id: number
  receipt_id: number
}

export function intoTransactionModel(model: TransactionAttributes): TransactionModel {
  const ret: TransactionModel = {
    id: model.id,
    state: model.state as TransactionState,
    payment_method: model.payment_method as PaymentMethod,
    user_id: model.user_id,
    shop_id: model.shop_id,
    receipt_id: model.receipt_id,
  }

  return ret
}
