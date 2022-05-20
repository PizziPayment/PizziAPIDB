import { Sequelize, Transaction } from 'sequelize'
import {
  initOrm,
  ReceiptModel,
  ReceiptsService,
  ShopModel,
  ShopsServices,
  TransactionModel,
  TransactionsService,
  UserModel,
  UsersServices,
} from '../../src/'
import { TransactionState } from '../../src/commons/services/orm/models/transactions.database.model'
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

async function setupReceiptUserAndShop(transaction: Transaction): Promise<[ReceiptModel, UserModel, ShopModel]> {
  return [
    (await ReceiptsService.createReceipt(10, '2000', transaction))._unsafeUnwrap(),
    (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap(),
    (await ShopsServices.createShop('test', '0202020202', 'address', 20000, transaction))._unsafeUnwrap(),
  ]
}

describe('Transaction domain', () => {
  it('should be able to create a pending transaction', async () => {
    const pending_transaction_sample: Omit<TransactionModel, 'id' | 'state' | 'shop_id' | 'user_id' | 'receipt_id'> = {
      payment_method: 'card',
    }
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const tested_transaction = (
        await TransactionsService.createPendingTransaction(
          receipt.id,
          user.id,
          shop.id,
          pending_transaction_sample.payment_method,
          transaction
        )
      )._unsafeUnwrap()

      expect(tested_transaction.state).toBe('pending')
      expect(tested_transaction.user_id).toBe(user.id)
      expect(tested_transaction.shop_id).toBe(shop.id)
      expect(tested_transaction.receipt_id).toBe(receipt.id)
      expect(tested_transaction.payment_method).toBe(pending_transaction_sample.payment_method)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a transaction from its id', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()
      const retrieved_transaction = (
        await TransactionsService.getTransactionById(created_transaction.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_transaction.id).toBe(created_transaction.id)
      expect(retrieved_transaction.state).toBe(created_transaction.state)
      expect(retrieved_transaction.user_id).toBe(created_transaction.user_id)
      expect(retrieved_transaction.shop_id).toBe(created_transaction.shop_id)
      expect(retrieved_transaction.receipt_id).toBe(created_transaction.receipt_id)
      expect(retrieved_transaction.payment_method).toBe(created_transaction.payment_method)
    } finally {
      await transaction.rollback()
    }
  })

  it("should be able to change a transaction's state", async () => {
    const transaction = await sequelize.transaction()
    const new_state: TransactionState = 'validated'
    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      expect(
        (await TransactionsService.updateTransactionStateFromId(created_transaction.id, new_state, transaction)).isOk()
      ).toBeTruthy()

      const retrieved_transaction = (
        await TransactionsService.getTransactionById(created_transaction.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_transaction.state).toBe(new_state)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be to retrieve every pending transaction associated to a specific owner', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      ;(
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction).map(
          (trans) => TransactionsService.updateTransactionStateFromId(trans.id, 'validated', transaction)
        )
      )._unsafeUnwrap()

      const user_transactions = (
        await TransactionsService.getOwnerTransactionsByState('user', user.id, 'pending', transaction)
      )._unsafeUnwrap()
      const shop_transaction = (
        await TransactionsService.getOwnerTransactionsByState('shop', shop.id, 'pending', transaction)
      )._unsafeUnwrap()

      expect(user_transactions).toHaveLength(1)
      expect(shop_transaction).toHaveLength(1)
      expect(user_transactions[0].id).toBe(created_transaction.id)
      expect(shop_transaction[0].id).toBe(created_transaction.id)
    } finally {
      await transaction.rollback()
    }
  })
})
