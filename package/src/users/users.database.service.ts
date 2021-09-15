import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/user.database.model'

export type UsersServiceResult<T> = ResultAsync<T, UsersServiceError>

export enum UsersServiceError {
  DatabaseError,
  UserNotFound,
}

export class UsersServices {
  static deleteUserById(user_id: number): UsersServiceResult<null> {
    return this.getUserFromId(user_id)
      .andThen(destroyUser)
      .map(() => null)
  }

  static getUserFromId(user_id: number): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(
      User.findOne({ where: { id: user_id } }),
      () => UsersServiceError.DatabaseError
    ).andThen((maybe_user) => (maybe_user ? okAsync(maybe_user) : errAsync(UsersServiceError.UserNotFound)))
  }

  static createUser(name: string, surname: string, address: string, zipcode: number): UsersServiceResult<UserModel> {
    return ResultAsync.fromPromise(
      User.create({
        address: address,
        firstname: name,
        surname: surname,
        zipcode: zipcode,
        picture_id: undefined,
      }),
      () => UsersServiceError.DatabaseError
    )
  }
}

// Pipeline

function destroyUser(user: UserModel): UsersServiceResult<UserModel> {
  return ResultAsync.fromPromise(User.destroy({ where: { id: user.id } }), () => UsersServiceError.DatabaseError).map(
    () => user
  )
}
