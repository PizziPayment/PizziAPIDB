export interface ShopModel {
  id: number
  name: string
  phone: string
  description?: string
  siret: number
  address: string
  city: string
  zipcode: number
  logo?: number
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
}

export type ShopUpdateModel = Pick<ShopModel, 'description' | 'website' | 'instagram' | 'twitter' | 'facebook'>
