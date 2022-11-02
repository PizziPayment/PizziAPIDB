import { ResultAsync } from 'neverthrow'
import { UserModel } from './models/user.model'
import User from '../commons/services/orm/models/users.database.model'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'
import { ImagesService } from '../images/images.database.service'
import Image from '../commons/services/orm/models/images.database.model'

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

  static updateAvatarFromImageId(
    user_id: number,
    image: Buffer,
    transaction: Transaction | null = null
  ): PizziResult<number> {
    return ResultAsync.fromPromise(User.findOne({ where: { id: user_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(userNotFoundErrorFilter(user_id))
      .andThen((user) => {
        const avatar_id = user.avatar_id

        if (avatar_id) {
          return ResultAsync.fromPromise(
            Image.update({ buffer: image }, { where: { id: avatar_id }, transaction }),
            () => PizziError.internalError()
          ).map(() => avatar_id)
        } else {
          return ImagesService.createImage(image, transaction).andThen((image_id) =>
            ResultAsync.fromPromise(user.update({ avatar_id: image_id }, { transaction }), () =>
              PizziError.internalError()
            ).map(() => image_id)
          )
        }
      })
  }
}

// Pipeline

function destroyUser(user: UserModel, transaction: Transaction | null): PizziResult<UserModel> {
  return ResultAsync.fromPromise(User.destroy({ where: { id: user.id }, transaction }), () =>
    PizziError.internalError()
  ).map(() => user)
}
