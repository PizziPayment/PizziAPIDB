export interface ReceiptModel {
  id: number
  tva_percentage: number
  total_price: number
}

interface DetailedReceiptItems {
  id: number
  name: string
  price: number
  quantity: number
  warranty: string
  eco_tax: number
  discount: number
}

export interface DetailedReceiptModel extends ReceiptModel {
  items: Array<DetailedReceiptItems>
}
