import { err, ok, Result } from 'neverthrow'
import ShopModel from './models/shop.model'
import Shop from '../commons/services/orm/models/shop.database.model'

export type ShopServiceResult<T> = Result<T, ShopServiceError>

export enum ShopServiceError {
  DatabaseError,
  ShopNotFound,
}

export class ShopServices {
  static async deleteShopById(shop_id: number): Promise<ShopServiceResult<null>> {
    try {
      const shop = await Shop.findOne({ where: { id: shop_id } })

      if (!shop) {
        return err(ShopServiceError.ShopNotFound)
      } else {
        await shop.destroy()
        return ok(null)
      }
    } catch {
      return err(ShopServiceError.DatabaseError)
    }
  }
  static async createShop(
    name: string,
    phone: string,
    address: string,
    zipcode: number
  ): Promise<ShopServiceResult<ShopModel>> {
    try {
      const shop = await Shop.create({
        address: address,
        name: name,
        phone: phone,
        description: undefined,
        zipcode: zipcode,
        logo: undefined,
        facebook: undefined,
        instagram: undefined,
        twitter: undefined,
        website: undefined,
      })

      return ok(shop)
    } catch {
      return err(ShopServiceError.DatabaseError)
    }
  }
}
