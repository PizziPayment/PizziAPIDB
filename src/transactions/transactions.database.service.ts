import { ResultAsync } from 'neverthrow'
import Transaction, {
  PaymentMethod,
  TransactionState,
} from '../commons/services/orm/models/transactions.database.model'
import { Transaction as SequelizeTransaction } from 'sequelize'
import { ExpandedTransactionModel, intoTransactionModel, TransactionModel } from './models/transaction.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import Shop from '../commons/services/orm/models/shops.database.model'
import Receipt from '../commons/services/orm/models/receipts.database.model'

export type TransactionsServiceResult<T> = ResultAsync<T, TransactionsServiceError>

export enum TransactionsServiceError {
  TransactionNotFound,
  DatabaseError,
}

export class TransactionsService {
  static getTransactionsByState(
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({ where: { state: state }, transaction }),
      () => TransactionsServiceError.DatabaseError
    ).map((pizzi_transactions) => pizzi_transactions.map(intoTransactionModel))
  }

  static getOwnerTransactionsByState(
    owner_type: 'user' | 'shop',
    owner_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({ where: { state: state, [`${owner_type}_id`]: owner_id }, transaction }),
      () => TransactionsServiceError.DatabaseError
    ).map((pizzi_transactions) => pizzi_transactions.map(intoTransactionModel))
  }


  static getOwnerExpandedTransactionsByState(
    owner_type: 'user' | 'shop',
    owner_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<Array<ExpandedTransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({
        where: { state: state, [`${owner_type}_id`]: owner_id },
        include: [{model: Shop}, {model: Receipt}],
        transaction
      }),
      () => TransactionsServiceError.DatabaseError
    ).map((pizzi_transactions) => pizzi_transactions.map((transaction) => {
      return {
        id: transaction.id,
        state: transaction.state as TransactionState,
        payment_method: transaction.payment_method as PaymentMethod,
        user_id: transaction.user_id,
        shop_id: transaction.shop_id,
        receipt_id: transaction.receipt_id,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        shop: {
          id: transaction.shop_id,
          name: transaction.shop.name,
          logo: transaction.shop.logo
        },
        receipt: {
          id: transaction.receipt_id,
          total_ttc: transaction.receipt.total_price
        }
      }
    }))
  }

  static getTransactionById(
    id: number,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.findOne({ where: { id: id }, transaction }),
      () => TransactionsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
      .map(intoTransactionModel)
  }

  static createPendingTransaction(
    receipt_id: number,
    user_id: number | null,
    shop_id: number,
    payment_method: PaymentMethod,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.create(
        {
          state: 'pending',
          user_id: user_id || undefined,
          shop_id: shop_id,
          payment_method: payment_method,
          receipt_id: receipt_id,
          created_at: new Date(),
        },
        { transaction }
      ),
      () => TransactionsServiceError.DatabaseError
    ).map(intoTransactionModel)
  }

  static getTransactionByReceiptId(
    receipt_id: number,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.findOne({ where: { receipt_id: receipt_id }, transaction }),
      () => TransactionsServiceError.DatabaseError
    )
    .andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
    .map(intoTransactionModel)
  }


  static updateTransactionPaymentMethodFromId(
    transaction_id: number,
    payment_method: PaymentMethod,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<null> {
    return ResultAsync.fromPromise(
      Transaction.update({ payment_method: payment_method, updated_at: new Date() }, { where: { id: transaction_id }, transaction, returning: true }),
      () => TransactionsServiceError.DatabaseError
    )
    .andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
    .map(() => null)
  }

  static updateTransactionStateFromId(
    transaction_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<null> {
    return ResultAsync.fromPromise(
      Transaction.update({ state: state, updated_at: new Date() }, { where: { id: transaction_id }, transaction, returning: true }),
      () => TransactionsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
      .map(() => null)
  }
}

// Pipeline
