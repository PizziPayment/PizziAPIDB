import { ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/users.database.model'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'

const userNotFoundErrorFilter = fieldNotFoundErrorFilter<User>('user', ErrorCause.UserNotFound)

export class UsersServices {
  static deleteUserById(user_id: number, transaction: Transaction | null = null): PizziResult<null> {
    return this.getUserFromId(user_id, transaction)
      .andThen(onTransaction(transaction, destroyUser))
      .map(() => null)
  }

  static getUserFromId(user_id: number, transaction: Transaction | null = null): PizziResult<UserModel> {
    return ResultAsync.fromPromise(User.findOne({ where: { id: user_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(userNotFoundErrorFilter(user_id))
  }

  static createUser(
    name: string,
    surname: string,
    address: string,
    zipcode: number,
    transaction: Transaction | null = null
  ): PizziResult<UserModel> {
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
  ): PizziResult<UserModel> {
    return ResultAsync.fromPromise(
      User.findOne({
        where: {
          id: user_id,
        },
        transaction,
      }),
      () => PizziError.internalError()
    )
      .andThen(userNotFoundErrorFilter(user_id))
      .andThen((user) =>
        ResultAsync.fromPromise(
          Object.assign(user, assignNonNullValues({ firstname: name, surname, address, zipcode })).save({
            transaction,
          }),
          () => PizziError.internalError()
        )
      )
  }

  // Returns the id of the previous avatar, if there was one
  static updateAvatarFromImageId(
    user_id: number,
    image_id: number,
    transaction: Transaction | null = null
  ): PizziResult<number | undefined> {
    return ResultAsync.fromPromise(User.findOne({ where: { id: user_id } }), () => PizziError.internalError())
      .andThen(userNotFoundErrorFilter(user_id))
      .andThen((user) => {
        let old_image: number | undefined = undefined

        if (user.avatar_id != null) {
          old_image = user.avatar_id
        }

        return ResultAsync.fromPromise(
          Object.assign(user, assignNonNullValues({ image: image_id })).save({ transaction }),
          () => PizziError.internalError()
        ).map(() => old_image)
      })
  }
}

// Pipeline

function destroyUser(user: UserModel, transaction: Transaction | null): PizziResult<UserModel> {
  return ResultAsync.fromPromise(User.destroy({ where: { id: user.id }, transaction }), () =>
    PizziError.internalError()
  ).map(() => user)
}
