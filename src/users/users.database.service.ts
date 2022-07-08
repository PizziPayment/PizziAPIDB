import { ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/users.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type UsersServiceResult<T> = ResultAsync<T, IPizziError>

export class UsersServices {
  static deleteUserById(user_id: number, transaction: Transaction | null = null): UsersServiceResult<null> {
    return this.getUserFromId(user_id, transaction)
      .andThen(onTransaction(transaction, destroyUser))
      .map(() => null)
  }

  static getUserFromId(user_id: number, transaction: Transaction | null = null): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(User.findOne({ where: { id: user_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.UserNotFound, `invalid user_id: ${user_id}`)))
  }

  static createUser(
    name: string,
    surname: string,
    address: string,
    zipcode: number,
    transaction: Transaction | null = null
  ): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(
      User.create(
        {
          address: address,
          firstname: name,
          surname: surname,
          zipcode: zipcode,
          picture_id: undefined,
        },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static updateUserFromId(
    user_id: number,
    name: string | null,
    surname: string | null,
    address: string | null,
    zipcode: number | null,
    transaction: Transaction | null = null
  ): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(
      User.findOne({
        where: {
          id: user_id,
        },
        transaction,
      }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.UserNotFound, `invalid user_id: ${user_id}`)))
      .andThen((user) =>
        ResultAsync.fromPromise(
          Object.assign(user, assignNonNullValues({ firstname: name, surname, address, zipcode })).save({
            transaction,
          }),
          () => PizziError.internalError()
        )
      )
  }
}

// Pipeline

function destroyUser(user: UserModel, transaction: Transaction | null): UsersServiceResult<UserModel> {
  return ResultAsync.fromPromise(User.destroy({ where: { id: user.id }, transaction }), () =>
    PizziError.internalError()
  ).map(() => user)
}
