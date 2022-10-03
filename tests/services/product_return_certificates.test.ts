import { config } from '../common/config'
import {
  initOrm,
  ProductReturnCertificatesService,
  ReceiptItemsService,
  ReceiptModel,
  ReceiptsService,
  ShopItemsService,
  ShopModel,
  ShopsServices,
  TransactionModel,
  TransactionsService,
  UserModel,
  UsersServices,
} from '../../src'
import { Transaction } from 'sequelize'
import ReceiptItemModel from '../../src/receipt_items/models/receipt_items.model'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

async function setupReceiptUserShopAndTransaction(
  transaction: Transaction
): Promise<[ReceiptModel, UserModel, ShopModel, TransactionModel, Array<ReceiptItemModel>]> {
  const receipt = (await ReceiptsService.createReceipt(10, 2000, transaction))._unsafeUnwrap()
  const user = (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap()
  const shop = (
    await ShopsServices.createShop('test', '0202020202', 2131313213, 'address', 'city', 20000, transaction)
  )._unsafeUnwrap()
  const shop_item = (await ShopItemsService.createShopItem(shop.id, 'Toto', 1000, transaction))._unsafeUnwrap()
  const receipt_items = (
    await ReceiptItemsService.createReceiptItems(
      receipt.id,
      [
        {
          discount: 0,
          shop_item_id: shop_item.id,
          eco_tax: 0,
          quantity: 10,
          warranty: 'TOTO',
        },
      ],
      transaction
    )
  )._unsafeUnwrap()
  const ptransaction = (
    await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'unassigned', transaction)
  )._unsafeUnwrap()

  return [receipt, user, shop, ptransaction, receipt_items]
}

describe('Product Return Certificates Domain', () => {
  it('Should be able to create a product return certificate', async () => {
    const transaction = await sequelize.transaction()
    try {
      const [, , , , receipt_items] = await setupReceiptUserShopAndTransaction(transaction)
      const product_return_certificate = (
        await ProductReturnCertificatesService.createProductReturnCertificateFromReceiptItemId(
          receipt_items[0].id,
          "reason",
          1,
          transaction
        )
      )._unsafeUnwrap()
      expect(product_return_certificate.receipt_item_id).toBe(receipt_items[0].id)
      expect(new Date(product_return_certificate.return_date).getDay()).toBe(new Date().getDay())
      expect(product_return_certificate.reason).toBe("reason")
      expect(product_return_certificate.quantity).toBe(1)
      expect(product_return_certificate.id).not.toBeNull()
    } finally {
      await transaction.rollback()
    }
  })
  it('Should be able to retrieve a product return certificate from its id', async () => {
    const transaction = await sequelize.transaction()
    try {
      const [, , , , receipt_items] = await setupReceiptUserShopAndTransaction(transaction)
      const product_return_certificate = (
        await ProductReturnCertificatesService.createProductReturnCertificateFromReceiptItemId(
          receipt_items[0].id,
          "reason",
          1,
          transaction
        )
      )._unsafeUnwrap()
      const retrieved_certificate = (
        await ProductReturnCertificatesService.getProductReturnCertificateFromId(
          product_return_certificate.id,
          transaction
        )
      )._unsafeUnwrap()

      expect(product_return_certificate.receipt_item_id).toBe(retrieved_certificate.receipt_item_id)
      expect(product_return_certificate.return_date).toStrictEqual(retrieved_certificate.return_date)
      expect(product_return_certificate.reason).toBe(retrieved_certificate.reason)
      expect(product_return_certificate.quantity).toBe(retrieved_certificate.quantity)
      expect(product_return_certificate.id).toBe(retrieved_certificate.id)
    } finally {
      await transaction.rollback()
    }
  })
  it('Should be able to retrieve a product return certificate from its receipt_item_id', async () => {
    const transaction = await sequelize.transaction()
    try {
      const [, , , , receipt_items] = await setupReceiptUserShopAndTransaction(transaction)
      const product_return_certificate = (
        await ProductReturnCertificatesService.createProductReturnCertificateFromReceiptItemId(
          receipt_items[0].id,
          "reason",
          1,
          transaction
        )
      )._unsafeUnwrap()
      const retrieved_certificate = (
        await ProductReturnCertificatesService.getProductReturnCertificateFromReceiptItemId(
          receipt_items[0].id,
          transaction
        )
      )._unsafeUnwrap()

      expect(retrieved_certificate).not.toBeNull()
      // Enforce type checking because expect.not.toBeNull() doesn't actually infer a not null type.
      if (retrieved_certificate !== null) {
        expect(product_return_certificate.receipt_item_id).toBe(retrieved_certificate.receipt_item_id)
        expect(product_return_certificate.return_date).toStrictEqual(retrieved_certificate.return_date)
        expect(product_return_certificate.reason).toBe(retrieved_certificate.reason)
        expect(product_return_certificate.quantity).toBe(retrieved_certificate.quantity)
        expect(product_return_certificate.id).toBe(retrieved_certificate.id)
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('Should be able to retrieve a product return certificate from its receipt_id', async () => {
    const transaction = await sequelize.transaction()
    try {
      const [receipt, , , , receipt_items] = await setupReceiptUserShopAndTransaction(transaction)
      const product_return_certificate = (
        await ProductReturnCertificatesService.createProductReturnCertificateFromReceiptItemId(
          receipt_items[0].id,
          "reason",
          1,
          transaction
        )
      )._unsafeUnwrap()
      const retrieved_certificates = (
        await ProductReturnCertificatesService.getProductReturnCertificatesFromReceiptId(receipt.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_certificates).toHaveLength(1)
      expect(product_return_certificate.receipt_item_id).toBe(retrieved_certificates[0].receipt_item_id)
      expect(product_return_certificate.return_date).toStrictEqual(retrieved_certificates[0].return_date)
      expect(product_return_certificate.reason).toBe(retrieved_certificates[0].reason)
      expect(product_return_certificate.quantity).toBe(retrieved_certificates[0].quantity)
      expect(product_return_certificate.id).toBe(retrieved_certificates[0].id)
    } finally {
      await transaction.rollback()
    }
  })
})
