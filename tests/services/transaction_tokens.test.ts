import { Transaction as STransaction } from 'sequelize'
import {
  initOrm,
  ReceiptModel,
  ReceiptsService,
  ShopModel,
  ShopsServices,
  TransactionModel,
  TransactionsService,
  TransactionTokensService,
  TransactionTokensServiceError,
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

async function setupReceiptUserShopAndTransaction(
  transaction: STransaction
): Promise<[ReceiptModel, UserModel, ShopModel, TransactionModel]> {
  const receipt = (await ReceiptsService.createReceipt(10, '2000', transaction))._unsafeUnwrap()
  const user = (await UsersServices.createUser('test', 'test', 'test', 3000, transaction))._unsafeUnwrap()
  const shop = (
    await ShopsServices.createShop('test', '0202020202', 2131313213, 'address', 'city', 20000, transaction)
  )._unsafeUnwrap()
  const ptransaction = (
    await TransactionsService.createPendingTransaction(receipt.id, user.id, shop.id, 'unassigned', transaction)
  )._unsafeUnwrap()

  return [receipt, user, shop, ptransaction]
}

describe('Transaction Token domain', () => {
  it('should be able to create a transaction token', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [, , , pizzi_transaction] = await setupReceiptUserShopAndTransaction(transaction)
      const tested_transaction_token = (
        await TransactionTokensService.createTemporaryToken(pizzi_transaction.id)
      )._unsafeUnwrap()

      expect(tested_transaction_token.transaction_id).toBe(pizzi_transaction.id)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a transaction token with its id', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [, , , pizzi_transaction] = await setupReceiptUserShopAndTransaction(transaction)
      const tested_transaction_token = (
        await TransactionTokensService.createTemporaryToken(pizzi_transaction.id)
      )._unsafeUnwrap()
      const retrieved_transaction_token = (
        await TransactionTokensService.getTransactionTokenById(tested_transaction_token.id)
      )._unsafeUnwrap()

      expect(tested_transaction_token.id).toBe(retrieved_transaction_token.id)
      expect(tested_transaction_token.transaction_id).toBe(retrieved_transaction_token.transaction_id)
      expect(tested_transaction_token.token).toBe(retrieved_transaction_token.token)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to validate a transaction token', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [, , , pizzi_transaction] = await setupReceiptUserShopAndTransaction(transaction)
      const tested_transaction_token = (
        await TransactionTokensService.createTemporaryToken(pizzi_transaction.id)
      )._unsafeUnwrap()

      expect(
        (
          await TransactionTokensService.getTransactionTokenByTransactionIdAndToken(
            tested_transaction_token.transaction_id,
            tested_transaction_token.token
          )
        ).isOk()
      ).toBeTruthy()
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to delete a transaction token', async () => {
    const transaction = await sequelize.transaction()

    try {
      const [, , , pizzi_transaction] = await setupReceiptUserShopAndTransaction(transaction)
      const tested_transaction_token = (
        await TransactionTokensService.createTemporaryToken(pizzi_transaction.id)
      )._unsafeUnwrap()

      await TransactionTokensService.deleteTransactionTokenById(tested_transaction_token.id)
      expect((await TransactionTokensService.getTransactionTokenById(tested_transaction_token.id)).isOk()).toBeFalsy()
      expect(
        (await TransactionTokensService.getTransactionTokenById(tested_transaction_token.id))._unsafeUnwrapErr()
      ).toBe(TransactionTokensServiceError.TransactionTokenNotFound)
      expect(
        (
          await TransactionTokensService.getTransactionTokenByTransactionIdAndToken(
            tested_transaction_token.transaction_id,
            tested_transaction_token.token
          )
        ).isOk()
      ).toBeFalsy()
    } finally {
      await transaction.rollback()
    }
  })
})
