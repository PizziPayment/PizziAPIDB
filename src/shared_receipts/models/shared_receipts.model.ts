import { ReceiptModel } from '../../receipts/models/receipts.model'

export interface SharedReceiptModel {
  id: number
  receipt_id: number
  recipient_id?: number
  shared_at: Date
}

export interface DetailedSharedReceiptModel {
  id: number
  user: { firstname: string; surname: string; avatar_id?: number }
  shop: {
    id: number
    name: string
    avatar_id?: number
  }
  receipt: ReceiptModel
  shared_at: Date
}
