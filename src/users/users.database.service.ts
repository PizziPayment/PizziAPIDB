import { ResultAsync } from 'neverthrow'
import { UserModel, UserWithCredsModel } from './models/user.model'
import User from '../commons/services/orm/models/users.database.model'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'
import { ImagesService } from '../images/images.database.service'
import Image from '../commons/services/orm/models/images.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import Credential from '../commons/services/orm/models/credentials.database.model'

const userNotFoundErrorFilter = fieldNotFoundErrorFilter<User>('user', ErrorCause.UserNotFound)

export class UsersServices {
  static deleteUserById(user_id: number, transaction?: Transaction): PizziResult<null> {
    return ResultAsync.fromPromise(User.destroy({ where: { id: user_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.UserNotFound, `invalid user id: ${user_id}`)))
      .map(() => null)
  }

  static getUserFromId(user_id: number, transaction: Transaction | null = null): PizziResult<UserModel> {
    return ResultAsync.fromPromise(User.findOne({ where: { id: user_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(userNotFoundErrorFilter(user_id))
  }

  static getUsersPage(page: number, nb_items: number, transaction?: Transaction): PizziResult<UserWithCredsModel[]> {
    return ResultAsync.fromPromise(
      User.findAll({
        limit: nb_items,
        offset: (page - 1) * nb_items,
        include: [{ model: Credential, required: true }],
        transaction,
      }),
      () => PizziError.internalError()
    )
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
