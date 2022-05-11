// @ts-ignore
import { config } from '../common/config'
import {
  initOrm,
  ShopItemCreationModel,
  ShopItemsService,
  ShopsServices,
  ReceiptsService,
  ReceiptItemsService,
} from '../../src'
import { ReceiptModel } from '../../src/receipts/models/receipts.model'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

describe('Receipt items domain', () => {
  it('should be able to create receipt item', async () => {
    const receipt_sample: Omit<ReceiptModel, 'id'> = {
      tva_percentage: 10,
      total_price: '4',
    }
    const shop_items_sample: Array<ShopItemCreationModel> = [
      {
        name: 'kidney',
        price: '4',
      },
    ]
    const transaction = await sequelize.transaction()

    try {
      const created_receipt = (
        await ReceiptsService.createReceipt(receipt_sample.tva_percentage, receipt_sample.total_price, transaction)
      )._unsafeUnwrap()

      expect(
        (
          await ShopsServices.createShop('test', '0202020202', 'address', 20000, transaction).map((shop) =>
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
                      'tototot',
                      transaction
                    )
                )
              )
            )
          )
        ).isOk()
      )
      const retrieved_items = (
        await ReceiptItemsService.getReceiptItems(created_receipt.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_items).toHaveLength(1)
      expect(retrieved_items[0].discount).toBe(0)
      expect(retrieved_items[0].eco_tax).toBe(0)
      expect(retrieved_items[0].quantity).toBe(1)
      expect(retrieved_items[0].warranty).toBe('tototot')
    } finally {
      await transaction.rollback()
    }
  })
})
