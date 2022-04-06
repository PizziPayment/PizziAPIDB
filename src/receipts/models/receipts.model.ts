export interface ReceiptModel {
  id: number
  tva_percentage: number
  total_price: string
}

export interface DetailedReceiptModel extends ReceiptModel {
  items: Array<{
    id: number
    name: string
    price: string
    quantity: number
    warranty: string
    eco_tax: number
    discount: number
  }>
}
