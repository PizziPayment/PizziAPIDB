import { ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/user.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'

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
}

// Pipeline

function destroyUser(user: UserModel, transaction: Transaction | null): UsersServiceResult<UserModel> {
  return ResultAsync.fromPromise(
    User.destroy({ where: { id: user.id }, transaction }),
    () => UsersServiceError.DatabaseError
  ).map(() => user)
}
