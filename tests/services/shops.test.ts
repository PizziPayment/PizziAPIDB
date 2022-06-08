import { Sequelize, Transaction } from 'sequelize'
import { ErrorCause, initOrm, ShopModel, ShopsServices, ShopUpdateModel } from '../../src'
import { config } from '../common/config'
import { shop } from '../common/models'

// @ts-ignore
let sequelize: Sequelize = undefined
// @ts-ignore
let transaction: Transaction = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

beforeEach(async () => {
  transaction = await sequelize.transaction()
})

afterAll(() => {
  return sequelize.close()
})

afterEach(async () => {
  await transaction.rollback()
})

async function setupShop(): Promise<ShopModel> {
  let res = await ShopsServices.createShop(
    shop.name,
    shop.phone,
    shop.siret,
    shop.address,
    shop.city,
    shop.zipcode,
    transaction
  )
  expect(res.isOk()).toBeTruthy()

  return res._unsafeUnwrap()
}

describe('Shop domain', () => {
  it('should be able able to create a shop', async () => {
    const created_shop = await setupShop()

    const res = await ShopsServices.getShopFromId(created_shop.id, transaction)
    expect(res.isOk()).toBeTruthy()
    const retrieved_shop = res._unsafeUnwrap()

    expect(created_shop.name).toBe(shop.name)
    expect(retrieved_shop.name).toBe(shop.name)
    expect(created_shop.phone).toBe(shop.phone)
    expect(retrieved_shop.phone).toBe(shop.phone)
    expect(created_shop.address).toBe(shop.address)
    expect(retrieved_shop.address).toBe(shop.address)
    expect(created_shop.siret).toBe(shop.siret)
    expect(retrieved_shop.siret).toBe(shop.siret)
    expect(created_shop.city).toBe(shop.city)
    expect(retrieved_shop.city).toBe(shop.city)
    expect(created_shop.zipcode).toBe(shop.zipcode)
    expect(retrieved_shop.zipcode).toBe(shop.zipcode)
  })

  it("should be able to update a shop's values", async () => {
    const created_shop = await setupShop()
    const new_values: ShopUpdateModel = {
      description: 'desc',
      website: 'https://shop.example.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
    }

    const res = await ShopsServices.updateShopFromId(created_shop.id, new_values, transaction)
    expect(res.isOk()).toBeTruthy()
    const updated_shop = res._unsafeUnwrap()

    expect(updated_shop.name).toBe(shop.name)
    expect(updated_shop.phone).toBe(shop.phone)
    expect(updated_shop.address).toBe(shop.address)
    expect(updated_shop.city).toBe(shop.city)
    expect(updated_shop.zipcode).toBe(shop.zipcode)
    expect(updated_shop.description).toBe(new_values.description)
    expect(updated_shop.website).toBe(new_values.website)
    expect(updated_shop.instagram).toBe(new_values.instagram)
    expect(updated_shop.twitter).toBe(new_values.twitter)
    expect(updated_shop.facebook).toBe(new_values.facebook)
  })

  it('should be able able to delete a shop', async () => {
    const created_shop = await setupShop()

    expect((await ShopsServices.deleteShopById(created_shop.id, transaction)).isOk()).toBeTruthy()

    const res = await ShopsServices.getShopFromId(created_shop.id, transaction)
    expect(res.isErr()).toBeTruthy()
    expect(res._unsafeUnwrapErr().code).toBe(ErrorCause.ShopNotFound)
  })
})
