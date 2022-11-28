import { SmallCredentialModel } from "../../credentials/models/credential.model"

export interface ShopModel {
  id: number
  name: string
  phone: string
  description?: string
  siret: number
  address: string
  city: string
  zipcode: number
  avatar_id?: number
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
}

export type ShopUpdateModel = Pick<ShopModel, 'description' | 'website' | 'instagram' | 'twitter' | 'facebook'>

export interface ShopWithCredsModel extends ShopModel { credential: SmallCredentialModel }
