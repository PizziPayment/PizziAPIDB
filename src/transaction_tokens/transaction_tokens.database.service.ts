import { randomBytes } from 'crypto'
import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import TransactionToken from '../commons/services/orm/models/transaction_token.database.model'
import { TransactionTokenModel } from './models/transaction_token.model'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type TransactionTokensServiceResult<T> = ResultAsync<T, IPizziError>

export class TransactionTokensService {
  static deleteTransactionTokenById(
    transaction_token_id: number,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<null> {
    return ResultAsync.fromPromise(TransactionToken.destroy({ where: { id: transaction_token_id }, transaction }), () =>
      PizziError.internalError()
    ).map(() => null)
  }

  static getTransactionTokenByTransactionIdAndToken(
    transaction_id: number,
    token: string,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<TransactionTokenModel> {
    return ResultAsync.fromPromise(
      TransactionToken.findOne({ where: { transaction_id: transaction_id, token: token }, transaction }),
      () => PizziError.internalError()
    ).andThen(
      okIfNotNullElse(new PizziError(ErrorCause.TransactionTokenNotFound, `invalid transaction_id: ${transaction_id}`))
    )
  }

  static getTransactionTokenById(
    transaction_id: number,
    transaction: Transaction | null = null
  ): TransactionTokensServiceResult<TransactionTokenModel> {
    return ResultAsync.fromPromise(TransactionToken.findOne({ where: { id: transaction_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(
      okIfNotNullElse(new PizziError(ErrorCause.TransactionTokenNotFound, `invalid transaction_id: ${transaction_id}`))
    )
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
      () => PizziError.internalError()
    )
  }
}
