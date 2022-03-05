import { ResultAsync } from 'neverthrow'
import Transaction, {
  PaymentMethod,
  TransactionState,
} from '../commons/services/orm/models/transactions.database.model'
import { Transaction as SequelizeTransaction } from 'sequelize'
import { intoTransactionModel, TransactionModel } from './models/transaction.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

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

  static getOwnersTransactionsByState(
    owner_type: 'user' | 'shop',
    owner_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({ where: { state: state, [`${owner_type}_id`]: owner_id }, nest: true, transaction }),
      () => TransactionsServiceError.DatabaseError
    ).map((pizzi_transactions) => pizzi_transactions.map(intoTransactionModel))
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
        },
        { transaction }
      ),
      () => TransactionsServiceError.DatabaseError
    ).map(intoTransactionModel)
  }

  static updateTransactionStateFromId(
    transaction_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionsServiceResult<null> {
    return ResultAsync.fromPromise(
      Transaction.findOne({ where: { id: transaction_id }, transaction }),
      () => TransactionsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
      .andThen((pizzi_transaction) =>
        ResultAsync.fromPromise(
          pizzi_transaction.set('state', state).save({ transaction }),
          () => TransactionsServiceError.DatabaseError
        )
      )
      .map(() => null)
  }
}

// Pipeline
