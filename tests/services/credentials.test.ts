import { Sequelize, Transaction } from 'sequelize'
import {
  CredentialModel,
  CredentialsService,
  CredentialsServiceError,
  EncryptionService,
  initOrm,
  ShopModel,
  ShopsServices,
  TokensService,
  TokensServiceError,
  UserModel,
  UsersServices,
} from '../../src'
import { config } from '../common/config'
import { credential, shop, user } from '../common/models'
import { setupToken } from './tokens.test'

// @ts-ignore
let sequelize: Sequelize = undefined
// @ts-ignore
let transaction: Transaction = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

beforeEach(async () => {
  transaction = await sequelize.transaction()
})

afterAll(() => {
  return sequelize.close()
})

afterEach(async () => {
  await transaction.rollback()
})

async function setupCredential(kind: 'shop' | 'user'): Promise<[ShopModel | UserModel, CredentialModel]> {
  const create_credential = async (id: number): Promise<CredentialModel> => {
    const res = await CredentialsService.createCredentialWithId(
      kind,
      id,
      credential.email,
      EncryptionService.encrypt(credential.password),
      transaction
    )
    expect(res.isOk()).toBeTruthy()

    return res._unsafeUnwrap()
  }

  if (kind == 'shop') {
    let res = await ShopsServices.createShop(
      shop.name,
      shop.phone,
      shop.siret,
      shop.address,
      shop.city,
      shop.zipcode,
      transaction
    )
    expect(res.isOk()).toBeTruthy()
    const created_shop = res._unsafeUnwrap()

    return [created_shop, await create_credential(created_shop.id)]
  } else {
    const res = await UsersServices.createUser(user.firstname, user.surname, user.address, user.zipcode, transaction)
    expect(res.isOk()).toBeTruthy()
    const created_user = res._unsafeUnwrap()

    return [created_user, await create_credential(created_user.id)]
  }
}

describe('Credential domain', () => {
  describe('should be able to create a credential for', () => {
    it('a shop', async () => {
      const [created_shop, _] = await setupCredential('shop')

      const res = await CredentialsService.getCredentialFromEmailAndPassword(
        credential.email,
        EncryptionService.encrypt(credential.password),
        transaction
      )
      expect(res.isOk()).toBeTruthy()
      const retrieve_credential = res._unsafeUnwrap()

      expect(retrieve_credential.admin_id).toBeNull()
      expect(retrieve_credential.shop_id).toBe(created_shop.id)
      expect(retrieve_credential.user_id).toBeNull()
    })

    it('a user', async () => {
      const [created_user, _] = await setupCredential('user')

      const res = await CredentialsService.getCredentialFromEmailAndPassword(
        credential.email,
        EncryptionService.encrypt(credential.password),
        transaction
      )
      expect(res.isOk()).toBeTruthy()
      const retrieve_credential = res._unsafeUnwrap()

      expect(retrieve_credential.admin_id).toBeNull()
      expect(retrieve_credential.shop_id).toBeNull()
      expect(retrieve_credential.user_id).toBe(created_user.id)
    })
  })

  it('should be able to delete a credential and its tokens', async () => {
    const [_, __, created_cred, created_token] = await setupToken(transaction)

    expect((await CredentialsService.deleteCredentialFromId(created_cred.id, transaction)).isOk()).toBeTruthy()
    const res = await TokensService.getTokenFromId(created_token.id, transaction)
    expect(res.isErr()).toBeTruthy()
    const error = res._unsafeUnwrapErr()

    expect(error).toBe(TokensServiceError.TokenNotFound)
  })

  describe('should be able to change', () => {
    it('an email', async () => {
      const new_email = 'new_email@example.com'
      const [_, created_cred] = await setupCredential('user')

      expect((await CredentialsService.changeEmail(created_cred.id, new_email, transaction)).isOk()).toBeTruthy()
      const res = await CredentialsService.getCredentialFromId(created_cred.id, transaction)
      expect(res.isOk()).toBeTruthy()
      const updated_cred = res._unsafeUnwrap()

      expect(updated_cred.email).toBe(new_email)
    })

    it('a password', async () => {
      const new_password = EncryptionService.encrypt('password')
      const [_, created_cred] = await setupCredential('user')

      expect((await CredentialsService.changePassword(created_cred.id, new_password, transaction)).isOk()).toBeTruthy()
      const res = await CredentialsService.getCredentialFromId(created_cred.id, transaction)
      expect(res.isOk()).toBeTruthy()
      const updated_cred = res._unsafeUnwrap()

      expect(updated_cred.password).toBe(new_password)
    })
  })

  it('should be able to retrieve credential from email an password', async () => {
    const [_, created_cred] = await setupCredential('user')

    const res = await CredentialsService.getCredentialFromEmailAndPassword(
      created_cred.email,
      created_cred.password,
      transaction
    )
    expect(res.isOk()).toBeTruthy()
    const retrieved_cred = res._unsafeUnwrap()

    expect(retrieved_cred.id).toBe(created_cred.id)
  })

  describe('should be able to know if an email is', () => {
    it('unique', async () => {
      const res = await CredentialsService.isEmailUnique('unique@example.com', transaction)

      expect(res.isOk()).toBeTruthy()
      expect(res._unsafeUnwrap()).toBeNull()
    })

    it('not unique', async () => {
      const [_, created_cred] = await setupCredential('user')
      const res = await CredentialsService.isEmailUnique(created_cred.email, transaction)

      expect(res.isErr()).toBeTruthy()
      expect(res._unsafeUnwrapErr()).toBe(CredentialsServiceError.DuplicatedEmail)
    })
  })

  describe("shouldn't be able to create credential with an invalid ", () => {
    it('user id', async () => {
      expect(
        (
          await CredentialsService.createCredentialWithId(
            'user',
            666,
            credential.email,
            EncryptionService.encrypt(credential.password),
            transaction
          )
        ).isErr()
      ).toBeTruthy()
    })

    it('shop id', async () => {
      expect(
        (
          await CredentialsService.createCredentialWithId(
            'shop',
            666,
            credential.email,
            EncryptionService.encrypt(credential.password),
            transaction
          )
        ).isErr()
      ).toBeTruthy()
    })
  })
})
