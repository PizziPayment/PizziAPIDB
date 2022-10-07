export default interface ReceiptItemModel {
  id: number
  receipt_id: number
  shop_item_id: number
  discount: number
  eco_tax: number
  tva_percentage: number
  quantity: number
  warranty: string
}

export interface DetailedReceiptItemModel extends ReceiptItemModel {
  name: string
  price: number
}
