import {
  initOrm,
  ReceiptItemsService,
  ReceiptModel,
  ReceiptsService,
  ShopItemCreationModel,
  ShopItemsService,
  ShopsServices,
} from '../../src'
// @ts-ignore
import { config } from '../common/config'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

describe('Receipts domain', () => {
  it('should be able to create a receipt', async () => {
    const transaction = await sequelize.transaction()

    try {
      const receipt_sample: Omit<ReceiptModel, 'id'> = {
        total_price: 9999,
      }

      const created_receipt = (
        await ReceiptsService.createReceipt(receipt_sample.total_price, transaction)
      )._unsafeUnwrap()

      expect(created_receipt.total_price).toBe(receipt_sample.total_price)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a list of receipts from their id', async () => {
    const transaction = await sequelize.transaction()

    try {
      const receipt_sample: Omit<ReceiptModel, 'id'> = {
        total_price: 9999,
      }

      const created_receipt = (
        await ReceiptsService.createReceipt(receipt_sample.total_price, transaction)
      )._unsafeUnwrap()
      const retrieved_receipt = (
        await ReceiptsService.getShortenedReceipts([created_receipt.id], transaction)
      )._unsafeUnwrap()

      expect(retrieved_receipt).toHaveLength(1)
      expect(retrieved_receipt[0].total_price).toBe(created_receipt.total_price)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a detailed receipt (without items) from its id', async () => {
    const transaction = await sequelize.transaction()

    try {
      const receipt_sample: Omit<ReceiptModel, 'id'> = {
        total_price: 9999,
      }

      const created_receipt = (
        await ReceiptsService.createReceipt(receipt_sample.total_price, transaction)
      )._unsafeUnwrap()
      const retrieved_receipt = (
        await ReceiptsService.getDetailedReceiptById(created_receipt.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_receipt.total_price).toBe(created_receipt.total_price)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a detailed receipt (with items) from its id', async () => {
    const shop_items_sample: Array<ShopItemCreationModel> = [
      {
        name: 'kidney',
        price: 300,
      },
      {
        name: 'lung',
        price: 4010,
      },
      {
        name: 'leg',
        price: 45034,
      },
    ]
    const transaction = await sequelize.transaction()

    try {
      const receipt_sample: Omit<ReceiptModel, 'id'> = {
        total_price: 140,
      }
      const created_receipt = (
        await ReceiptsService.createReceipt(receipt_sample.total_price, transaction)
      )._unsafeUnwrap()

        ; (
          await ShopsServices.createShop('test', '0202020202', 123213, 'address', 'city', 20000, transaction).map(
            (shop) =>
              ShopItemsService.createShopItems(shop.id, shop_items_sample, transaction).map((shop_items) =>
                Promise.all(
                  shop_items.map(
                    async (shop_item) =>
                      await ReceiptItemsService.createReceiptItem(
                        created_receipt.id,
                        shop_item.id,
                        0,
                        0,
                        1,
                        10,
                        'tototot',
                        transaction
                      )
                  )
                )
              )
          )
        )._unsafeUnwrap()

      const retrieved_receipt = (
        await ReceiptsService.getDetailedReceiptById(created_receipt.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_receipt.items).toHaveLength(3)
      expect(retrieved_receipt.total_price).toBe(created_receipt.total_price)
    } finally {
      await transaction.rollback()
    }
  })
})
