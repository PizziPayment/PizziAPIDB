import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize/types'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'
import Image from '../commons/services/orm/models/images.database.model'

const imageNotFoundErrorFilter = fieldNotFoundErrorFilter<Image>('image', ErrorCause.ImageNotFound)

export class ImagesService {
  static createImage(buffer: Buffer, transaction: Transaction | null = null): PizziResult<number> {
    return ResultAsync.fromPromise(Image.create({ buffer }, { transaction, returning: ['id'] }), () =>
      PizziError.internalError()
    ).map((image) => image.id)
  }

  static deleteImageById(id: number, transaction: Transaction | null = null): PizziResult<void> {
    return ResultAsync.fromPromise(Image.destroy({ where: { id }, transaction }), () => PizziError.internalError()).map(
      () => undefined
    )
  }

  static getImageById(id: number, transaction: Transaction | null = null): PizziResult<Buffer> {
    return ResultAsync.fromPromise(Image.findByPk(id, { transaction }), () => PizziError.internalError())
      .andThen(imageNotFoundErrorFilter(id))
      .map((image) => image.buffer)
  }
}
