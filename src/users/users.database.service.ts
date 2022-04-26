import { ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/users.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { assignNonNullValues } from '../commons/services/util.service'

export type UsersServiceResult<T> = ResultAsync<T, UsersServiceError>

export enum UsersServiceError {
  DatabaseError,
  UserNotFound,
}

export class UsersServices {
  static deleteUserById(user_id: number, transaction: Transaction | null = null): UsersServiceResult<null> {
    return this.getUserFromId(user_id, transaction)
      .andThen(onTransaction(transaction, destroyUser))
      .map(() => null)
  }

  static getUserFromId(user_id: number, transaction: Transaction | null = null): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(
      User.findOne({ where: { id: user_id }, transaction }),
      () => UsersServiceError.DatabaseError
    ).andThen(okIfNotNullElse(UsersServiceError.UserNotFound))
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
      () => UsersServiceError.DatabaseError
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
      () => UsersServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(UsersServiceError.UserNotFound))
      .andThen((user) =>
        ResultAsync.fromPromise(
          Object.assign(user, assignNonNullValues({ firstname: name, surname, address, zipcode })).save({
            transaction,
          }),
          () => UsersServiceError.DatabaseError
        )
      )
  }
}

// Pipeline

function destroyUser(user: UserModel, transaction: Transaction | null): UsersServiceResult<UserModel> {
  return ResultAsync.fromPromise(
    User.destroy({ where: { id: user.id }, transaction }),
    () => UsersServiceError.DatabaseError
  ).map(() => user)
}
