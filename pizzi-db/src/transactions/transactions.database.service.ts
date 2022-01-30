import { ResultAsync } from 'neverthrow'
import Transaction, {
  PaymentMethod,
  TransactionState,
} from '../commons/services/orm/models/transactions.database.model'
import { Transaction as SequelizeTransaction } from 'sequelize'
import { TransactionModel } from './models/transaction.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

export type TransactionServiceResult<T> = ResultAsync<T, TransactionsServiceError>

export enum TransactionsServiceError {
  TransactionNotFound,
  DatabaseError,
}

export class TransactionsService {
  static getTransactionsByState(
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionServiceResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({ where: { state: state }, transaction }),
      () => TransactionsServiceError.DatabaseError
    )
  }

  static getTransactionById(
    id: number,
    transaction: SequelizeTransaction | null = null
  ): TransactionServiceResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.findOne({ where: { id: id }, transaction }),
      () => TransactionsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(TransactionsServiceError.TransactionNotFound))
  }

  static createPendingTransaction(
    receipt_id: number,
    user_id: number | null,
    payment_method: PaymentMethod,
    transaction: SequelizeTransaction | null = null
  ): TransactionServiceResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.create(
        {
          state: 'pending',
          user_id: user_id || undefined,
          payment_method: payment_method,
          receipt_id: receipt_id,
        },
        { transaction }
      ),
      () => TransactionsServiceError.DatabaseError
    )
  }

  static updateTransactionStateFromId(
    transaction_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): TransactionServiceResult<null> {
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
