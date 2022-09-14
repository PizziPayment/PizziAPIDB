import { config } from '../common/config'
import {
    CredentialModel,
    CredentialsService,
  initOrm,
  ReceiptItemsService,
  ReceiptModel,
  ReceiptsService,
  SharedReceiptsService,
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
): Promise<[ReceiptModel, UserModel, UserModel, CredentialModel, ShopModel, TransactionModel, Array<ReceiptItemModel>]> {
  const receipt = (await ReceiptsService.createReceipt(10, 2000, transaction))._unsafeUnwrap()
  const user = (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap()
  const user2 = (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap()
  const credential2 = (await CredentialsService.createCredentialWithId("user", user2.id, 'test@test.eu', 'hashed', transaction))._unsafeUnwrap()
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

  return [receipt, user, user2, credential2, shop, ptransaction, receipt_items]
}

describe('Shared Receipt domain', () => {
  it("should be able to get a receipt", async () => {
    const transaction = await sequelize.transaction()
    try {
      const [receipt, , , credential, , , ] = await setupReceiptUserShopAndTransaction(transaction)
      const shared_receipt = (await SharedReceiptsService.shareReceiptByEmail(receipt.id, credential.email, transaction))._unsafeUnwrap()
      const retrieved_receipt = (await SharedReceiptsService.getSharedReceiptByUserId(credential.user_id as number, transaction))._unsafeUnwrap()

      expect(retrieved_receipt).not.toBeNull()
      expect(retrieved_receipt[0].id).toBe(shared_receipt.id)
      expect(retrieved_receipt[0].completed).toBe(shared_receipt.completed)
      expect(retrieved_receipt[0].shared_at).toStrictEqual(shared_receipt.shared_at)
      expect(retrieved_receipt[0].receipt_id).toBe(shared_receipt.receipt_id)
      expect(retrieved_receipt[0].recipient_id).toBe(shared_receipt.recipient_id)
    }
    finally {
      await transaction.rollback()
    }
  })

  it("should be able to share a receipt", async () => {
    const transaction = await sequelize.transaction()
    try {
      const [receipt, , , credential, , , ] = await setupReceiptUserShopAndTransaction(transaction)

      const shared_receipt = (await SharedReceiptsService.shareReceiptByEmail(receipt.id, credential.email, transaction))._unsafeUnwrap()
      expect(shared_receipt).not.toBeNull()
    }
    finally {
      await transaction.rollback()
    }
  })
})
