import ReceiptItemModel from '../../receipt_items/models/receipt_items.model'

export interface ProductReturnCertificateModel {
  id: number
  receipt_item_id: number
  reason: string
  quantity: number
  return_date: Date
}

export interface ProductReturnDetailedCertificateModel {
  id: number
  receipt_item: ReceiptItemModel
  reason: string
  quantity: number
  return_date: Date
}
