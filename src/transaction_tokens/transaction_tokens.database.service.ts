import { randomBytes } from 'crypto'
import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import TransactionToken from '../commons/services/orm/models/transaction_token.database.model'
import { TransactionTokenModel } from './models/transaction_token.model'

export type TransactionTokensServiceResult<T> = ResultAsync<T, TransactionTokensServiceError>

export enum TransactionTokensServiceError {
  TransactionTokenNotFound,
  DatabaseError,
}

export class TransactionTokensService {
  static deleteTransactionTokenById(
    transaction_token_id: number,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<null> {
    return ResultAsync.fromPromise(
      TransactionToken.destroy({ where: { id: transaction_token_id }, transaction }),
      () => TransactionTokensServiceError.DatabaseError
    ).map(() => null)
  }

  static validateTransactionToken(
    transaction_id: number,
    token: string,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<null> {
    return ResultAsync.fromPromise(
      TransactionToken.findOne({ where: { transaction_id: transaction_id, token: token }, transaction }),
      () => TransactionTokensServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(TransactionTokensServiceError.TransactionTokenNotFound))
      .map(() => null)
  }

  static getTransactionTokenById(
    transaction_id: number,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<TransactionTokenModel> {
    return ResultAsync.fromPromise(
      TransactionToken.findOne({ where: { id: transaction_id }, transaction }),
      () => TransactionTokensServiceError.DatabaseError
    ).andThen(okIfNotNullElse(TransactionTokensServiceError.TransactionTokenNotFound))
  }

  static createTemporaryToken(
    transaction_id: number,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<TransactionTokenModel> {
    return ResultAsync.fromPromise(
      TransactionToken.create(
        {
          transaction_id: transaction_id,
          token: randomBytes(20).toString('hex'),
        },
        { transaction }
      ),
      (e) => {
        const err = e as Error
        console.log(err.name)
        console.log(err.message)
        console.log(transaction_id)
        return TransactionTokensServiceError.DatabaseError
      }
    )
  }
}
