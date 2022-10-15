import { Sequelize, Transaction } from 'sequelize'
import {
  Filter,
  initOrm,
  PaymentMethod,
  ReceiptModel,
  ReceiptsService,
  ShopModel,
  ShopsServices,
  TransactionModel,
  TransactionsService,
  TransactionState,
  UserModel,
  UsersServices,
} from '../../src/'
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
    (await ReceiptsService.createReceipt(10, transaction))._unsafeUnwrap(),
    (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap(),
    (
      await ShopsServices.createShop('test', '0202020202', 2131313213, 'address', 'city', 20000, transaction)
    )._unsafeUnwrap(),
  ]
}

async function setupMultipleReceiptsTransactionsUserAndShop(
  transaction: Transaction
): Promise<[Array<[ReceiptModel, TransactionModel]>, UserModel, ShopModel]> {
  const user = (await UsersServices.createUser('User', 'test', 'test', 3000, transaction))._unsafeUnwrap()
  const shop = (
    await ShopsServices.createShop('Shop', '0202020202', 2131313213, 'address', 'city', 20000, transaction)
  )._unsafeUnwrap()

  const makeTransactionAndReceipt = async (tva: number): Promise<[ReceiptModel, TransactionModel]> => {
    const receipt = (await ReceiptsService.createReceipt(tva, transaction))._unsafeUnwrap()
    const trans = (
      await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
    )._unsafeUnwrap()

    ;(await TransactionsService.updateTransactionStateFromId(trans.id, 'validated', transaction))._unsafeUnwrap()

    return [receipt, trans]
  }

  return [
    [await makeTransactionAndReceipt(20), await makeTransactionAndReceipt(20), await makeTransactionAndReceipt(20)],
    user,
    shop,
  ]
}

describe('Transaction domain', () => {
  it('should be able to create a pending transaction', async () => {
    const pending_transaction_sample: Omit<
      TransactionModel,
      'id' | 'state' | 'shop_id' | 'user_id' | 'receipt_id' | 'created_at' | 'updated_at'
    > = {
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

  it("should be able to change a transaction's payment method", async () => {
    const transaction = await sequelize.transaction()
    const new_payment_method: PaymentMethod = 'cash'
    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      expect(
        (
          await TransactionsService.updateTransactionPaymentMethodFromId(
            created_transaction.id,
            new_payment_method,
            transaction
          )
        ).isOk()
      ).toBeTruthy()

      const retrieved_transaction = (
        await TransactionsService.getTransactionById(created_transaction.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_transaction.payment_method).toBe(new_payment_method)
    } finally {
      await transaction.rollback()
    }
  })

  it("should be able to change a transaction's user_id", async () => {
    const transaction = await sequelize.transaction()
    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, null, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      expect(
        (await TransactionsService.updateTransactionUserIdFromId(created_transaction.id, user.id, transaction)).isOk()
      ).toBeTruthy()

      const retrieved_transaction = (
        await TransactionsService.getTransactionById(created_transaction.id, transaction)
      )._unsafeUnwrap()

      expect(retrieved_transaction.user_id).toBe(user.id)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve every pending transaction associated to a specific owner', async () => {
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

  it('should be able to retrieve every pending transaction associated to a specific owner', async () => {
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

  it("should be able to retrieve a users' expanded transaction by state", async () => {
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      const expanded_transactions = (
        await TransactionsService.getOwnerExpandedTransactionsByState('user', user.id, 'pending', {}, transaction)
      )._unsafeUnwrap()

      expect(expanded_transactions).toHaveLength(1)
      expect(expanded_transactions[0].id).toBe(created_transaction.id)
      expect(expanded_transactions[0].user_id).toBe(created_transaction.user_id)
      expect(expanded_transactions[0].user_id).toBe(user.id)
      expect(expanded_transactions[0].shop.id).toBe(created_transaction.shop_id)
      expect(expanded_transactions[0].shop.id).toBe(shop.id)
      expect(expanded_transactions[0].shop.name).toBe(shop.name)
      expect(expanded_transactions[0].state).toBe(created_transaction.state)
      expect(expanded_transactions[0].receipt.id).toBe(receipt.id)
      expect(expanded_transactions[0].receipt.total_ht).toBe(receipt.total_price)
      expect(expanded_transactions[0].created_at.toString()).toBe(created_transaction.created_at.toString())
      expect(expanded_transactions[0].updated_at?.toString()).toBe(created_transaction.updated_at?.toString())
    } finally {
      await transaction.rollback()
    }
  })
  it("should be able to retrieve a shop's expanded transaction by state", async () => {
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      const created_transaction = (
        await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)
      )._unsafeUnwrap()

      const expanded_transactions = (
        await TransactionsService.getOwnerExpandedTransactionsByState('shop', shop.id, 'pending', {}, transaction)
      )._unsafeUnwrap()

      expect(expanded_transactions).toHaveLength(1)
      expect(expanded_transactions[0].id).toBe(created_transaction.id)
      expect(expanded_transactions[0].user_id).toBe(created_transaction.user_id)
      expect(expanded_transactions[0].user_id).toBe(user.id)
      expect(expanded_transactions[0].shop.id).toBe(created_transaction.shop_id)
      expect(expanded_transactions[0].shop.id).toBe(shop.id)
      expect(expanded_transactions[0].shop.name).toBe(shop.name)
      expect(expanded_transactions[0].state).toBe(created_transaction.state)
      expect(expanded_transactions[0].receipt.id).toBe(receipt.id)
      expect(expanded_transactions[0].receipt.total_ht).toBe(receipt.total_price)
      expect(expanded_transactions[0].created_at.toString()).toBe(created_transaction.created_at.toString())
      expect(expanded_transactions[0].updated_at?.toString()).toBe(created_transaction.updated_at?.toString())
    } finally {
      await transaction.rollback()
    }
  })
  it("should be able to retrieve a shop's expanded transaction by state (shouldn't retrieve any)", async () => {
    const transaction = await sequelize.transaction()

    try {
      const [receipt, user, shop] = await setupReceiptUserAndShop(transaction)
      await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'card', transaction)

      const expanded_transactions = (
        await TransactionsService.getOwnerExpandedTransactionsByState('shop', shop.id, 'validated', {}, transaction)
      )._unsafeUnwrap()

      expect(expanded_transactions).toHaveLength(0)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retreive transactions sorted by ascending price', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [_transactions, user, _shop] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { filter: Filter.PriceAscending },
          transaction
        )
      )._unsafeUnwrap()

      for (let i = 1; i < results.length; i++) {
        expect(results[i].receipt.total_ht).toBeGreaterThanOrEqual(results[i - 1].receipt.total_ht)
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('should be able to retreive transactions sorted by descending price', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [_transactions, user, _shop] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { filter: Filter.PriceDescending },
          transaction
        )
      )._unsafeUnwrap()

      for (let i = 1; i < results.length; i++) {
        expect(results[i].receipt.total_ht).toBeLessThanOrEqual(results[i - 1].receipt.total_ht)
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('should be able to retreive transactions sorted by ascending date', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [_transactions, user, _shop] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { filter: Filter.Oldest },
          transaction
        )
      )._unsafeUnwrap()

      for (let i = 1; i < results.length; i++) {
        expect(results[i].created_at.getTime()).toBeGreaterThanOrEqual(results[i - 1].created_at.getTime())
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('should be able to retreive transactions sorted by descending date', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [_transactions, user, _shop] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { filter: Filter.Latest },
          transaction
        )
      )._unsafeUnwrap()

      for (let i = 1; i < results.length; i++) {
        expect(results[i].created_at.getTime()).toBeLessThanOrEqual(results[i - 1].created_at.getTime())
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('should be able to retreive transactions from a given date', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [transactions, user, _shop] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const from = transactions[1][1].created_at
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { from },
          transaction
        )
      )._unsafeUnwrap()

      expect(results.length).toEqual(2)

      for (let i = 1; i < results.length; i++) {
        expect(results[i].created_at.getTime()).toBeGreaterThanOrEqual(from.getTime())
      }
    } finally {
      await transaction.rollback()
    }
  })
  it('should be able to retreive transactions up to a given date', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [transactions, user] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const to = transactions[1][1].created_at
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState('user', user.id, 'validated', { to }, transaction)
      )._unsafeUnwrap()

      expect(results.length).toEqual(2)

      for (let i = 1; i < results.length; i++) {
        expect(results[i].created_at.getTime()).toBeLessThanOrEqual(to.getTime())
      }
    } finally {
      await transaction.rollback()
    }
  })
  it("should be able to retreive transactions by the shop's name", async () => {
    const transaction = await sequelize.transaction()

    try {
      const [, user] = await setupMultipleReceiptsTransactionsUserAndShop(transaction)
      const results = (
        await TransactionsService.getOwnerExpandedTransactionsByState(
          'user',
          user.id,
          'validated',
          { query: 'sho' },
          transaction
        )
      )._unsafeUnwrap()

      expect(results.length).toEqual(3)

      for (let i = 0; i < results.length; i++) {
        expect(results[i].shop.name).toBe('Shop')
      }
    } finally {
      await transaction.rollback()
    }
  })
})
