// @ts-ignore
import { config } from '../common/config'
import { ShopsServices, TransactionsService, UsersServices } from '../../src/'
import { initOrm } from '../../src'
import ReceiptsService from '../../src/receipts/receipts.database.service'
import { Sequelize } from 'sequelize'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

describe('Transaction domain', () => {
  it('should be able to create a pending transaction', async () => {
    const transaction = await sequelize.transaction()

    try {
      const receipt = (await ReceiptsService.createReceipt(10, '2000', transaction))._unsafeUnwrap()
      const user = (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap()
      const shop = (await ShopsServices.createShop('test', '0202020202', 'address', 20000, transaction))._unsafeUnwrap()
      const tested_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()
      const retrieved_transaction = (
        await TransactionsService.getTransactionById(tested_transaction.id, transaction)
      )._unsafeUnwrap()

      expect(tested_transaction.id).toBe(retrieved_transaction.id)
      expect(tested_transaction.state).toBe(retrieved_transaction.state)
      expect(tested_transaction.user_id).toBe(retrieved_transaction.user_id)
      expect(tested_transaction.shop_id).toBe(retrieved_transaction.shop_id)
      expect(tested_transaction.receipt_id).toBe(retrieved_transaction.receipt_id)
      expect(tested_transaction.payment_method).toBe(retrieved_transaction.payment_method)
    } finally {
      await transaction.rollback()
    }
  })
})
