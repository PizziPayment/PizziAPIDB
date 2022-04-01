export default interface ReceiptItemModel {
  id: number
  receipt_id: number
  shop_item_id: number
  discount: number
  eco_tax: number
  quantity: number
  warranty: string
}
