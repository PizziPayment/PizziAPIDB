export interface ReceiptModel {
  id: number
  tva_percentage: number
  total_price: string
  shop?: {
    name: string
    logo?: number
  }
  user?: {
    firstname: string
    surname: string
  }
}

interface DetailedReceiptItems {
  id: number
  name: string
  price: string
  quantity: number
  warranty: string
  eco_tax: number
  discount: number
}

export interface DetailedReceiptModel extends ReceiptModel {
  items: Array<DetailedReceiptItems>
}
