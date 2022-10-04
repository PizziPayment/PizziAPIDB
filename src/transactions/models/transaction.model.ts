import {
  PaymentMethod,
  TransactionState,
  TransactionAttributes,
} from '../../commons/services/orm/models/transactions.database.model'

export { PaymentMethod, TransactionState }

export interface TransactionModel {
  id: number
  state: TransactionState
  payment_method: PaymentMethod
  user_id?: number | null
  shop_id: number
  receipt_id: number
  created_at: Date
  updated_at?: Date
}

export interface ExpandedTransactionModel extends Omit<TransactionModel, 'shop_id' | 'receipt_id'> {
  shop: {
    id: number
    name: string
    avatar_id?: number
  }
  receipt: {
    id: number
    total_ht: number
    tva_percentage: number
  }
}

export function intoTransactionModel(model: TransactionAttributes): TransactionModel {
  return {
    id: model.id,
    state: model.state as TransactionState,
    payment_method: model.payment_method as PaymentMethod,
    user_id: model.user_id,
    shop_id: model.shop_id,
    receipt_id: model.receipt_id,
    created_at: model.created_at,
    updated_at: model.updated_at,
  }
}
