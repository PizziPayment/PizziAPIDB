export interface ShopModel {
  id: number
  name: string
  phone: string
  description?: string
  address: string
  zipcode: number
  logo?: number
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
  enabled: boolean
}

export type ShopUpdateModel = Pick<ShopModel, 'description' | 'website' | 'instagram' | 'twitter' | 'facebook'>
