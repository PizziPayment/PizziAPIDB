import { ImagesService, initOrm } from '../../src'

// @ts-ignore
import { config } from '../common/config'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

const data = [2, 2, 0, 2, 1, 1, 0, 2, 1]

describe('Images domain', () => {
  it('should be able to store an image', async () => {
    const transaction = await sequelize.transaction()

    try {
      ;(await ImagesService.createImage(Buffer.from(data), transaction))._unsafeUnwrap()
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to retrieve a stored image', async () => {
    const transaction = await sequelize.transaction()

    try {
      const id = (await ImagesService.createImage(Buffer.from(data), transaction))._unsafeUnwrap()
      const buffer = (await ImagesService.getImageById(id, transaction))._unsafeUnwrap()
      const image = [...buffer]

      expect(image).toEqual(data)
    } finally {
      await transaction.rollback()
    }
  })

  it('should be able to delete a stored image', async () => {
    const transaction = await sequelize.transaction()

    try {
      const id = (await ImagesService.createImage(Buffer.from(data), transaction))._unsafeUnwrap()
      ;(await ImagesService.deleteImageById(id, transaction))._unsafeUnwrap()
      ;(await ImagesService.getImageById(id, transaction))._unsafeUnwrapErr()
    } finally {
      await transaction.rollback()
    }
  })
})
