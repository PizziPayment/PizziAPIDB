export interface ReceiptModel {
  id: number
  total_price: number
}

interface DetailedReceiptItems {
  id: number
  name: string
  price: number
  tva_percentage: number
  quantity: number
  warranty: string
  eco_tax: number
  discount: number
}

export interface DetailedReceiptModel extends ReceiptModel {
  created_at: Date
  items: Array<DetailedReceiptItems>
}
