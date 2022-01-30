import { ResultAsync } from 'neverthrow'
import Transaction, { TransactionState } from '../commons/services/orm/models/transactions.database.model'
import { Transaction as SequelizeTransaction } from 'sequelize'
import { TransactionModel } from './models/transaction.model'

export type TransactionServiceResult<T> = ResultAsync<T, TransactionsServiceError>

export enum TransactionsServiceError {
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
}

// Pipeline
