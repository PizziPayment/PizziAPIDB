export interface ReceiptModel {
  id: number
  tva_percentage: number
}

export interface DetailedReceiptModel extends ReceiptModel {
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    warranty: string
    eco_tax: number
    discount: number
  }>
}
