import { DetailedReceiptModel } from '../../receipts/models/receipts.model'

export interface SharedReceiptModel {
  id: number
  receipt_id: number
  recipient_id?: number
  shared_at: Date
}

export interface DetailedSharedReceiptModel {
  id: number
  user: ConciseUserModel
  receipt: DetailedReceiptModel
  shared_at: Date
}

interface ConciseUserModel {
  firstname: string
  surname: string
  avatar_id?: number
}
