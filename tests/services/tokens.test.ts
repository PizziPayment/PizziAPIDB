import { Sequelize, Transaction } from 'sequelize'
import {
  ClientModel,
  ClientsService,
  CredentialModel,
  CredentialsService,
  EncryptionService,
  initOrm,
  TokenModel,
  TokensService,
  TokensServiceError,
  UserModel,
  UsersServices,
} from '../../src'
import { config } from '../common/config'
import { credential, user } from '../common/models'

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

export async function setupToken(t: Transaction): Promise<[ClientModel, UserModel, CredentialModel, TokenModel]> {
  const res_client = await ClientsService.createClientFromIdAndSecret('test', 'test', t)
  expect(res_client.isOk()).toBeTruthy()
  const created_client = res_client._unsafeUnwrap()

  const res_user = await UsersServices.createUser(user.firstname, user.firstname, user.address, user.zipcode, t)
  expect(res_user.isOk()).toBeTruthy()
  const created_user = res_user._unsafeUnwrap()

  const res_cred = await CredentialsService.createCredentialWithId(
    'user',
    created_user.id,
    credential.email,
    EncryptionService.encrypt(credential.password),
    t
  )
  expect(res_cred.isOk()).toBeTruthy()
  const created_cred = res_cred._unsafeUnwrap()

  const res_token = await TokensService.generateTokenBetweenClientAndCredential(created_client.id, created_cred.id, t)
  expect(res_token.isOk()).toBeTruthy()
  const created_token = res_token._unsafeUnwrap()

  return [created_client, created_user, created_cred, created_token]
}

describe('Token domain', () => {
  it('should be able to create a token', async () => {
    const date = new Date()
    const [created_client, _, created_cred, created_token] = await setupToken(transaction)

    expect(created_token.client_id).toBe(created_client.id)
    expect(created_token.credential_id).toBe(created_cred.id)
    expect(created_token.access_expires_at.getTime()).toBeGreaterThan(date.getTime())
    expect(created_token.refresh_expires_at.getTime()).toBeGreaterThan(date.getTime())
  })

  it('should be able to refresh an expired token', async () => {
    const [_, __, ___, expried_token] = await setupToken(transaction)

    const res = await TokensService.refreshToken(expried_token, transaction)
    expect(res.isOk()).toBeTruthy()
    const new_token = res._unsafeUnwrap()

    expect(new_token.id).toBe(expried_token.id)
    expect(new_token.access_expires_at.getTime()).toBeGreaterThan(expried_token.access_expires_at.getTime())
    expect(new_token.refresh_expires_at.getTime()).toBeGreaterThan(expried_token.refresh_expires_at.getTime())
  })

  describe('should be able to retrieve a token from', () => {
    it('its access value', async () => {
      const [_, __, ___, created_token] = await setupToken(transaction)

      const res = await TokensService.getTokenFromAccessValue(created_token.access_token, transaction)
      expect(res.isOk()).toBeTruthy()
      const retrieved_token = res._unsafeUnwrap()

      expect(retrieved_token.id).toBe(created_token.id)
    })

    it('its refresh value', async () => {
      const [_, __, ___, created_token] = await setupToken(transaction)

      const res = await TokensService.getTokenFromRefreshValue(created_token.refresh_token, transaction)
      expect(res.isOk()).toBeTruthy()
      const retrieved_token = res._unsafeUnwrap()

      expect(retrieved_token.id).toBe(created_token.id)
    })

    it('id', async () => {
      const [_, __, ___, created_token] = await setupToken(transaction)

      const res = await TokensService.getTokenFromId(created_token.id, transaction)
      expect(res.isOk()).toBeTruthy()
      const retrieved_token = res._unsafeUnwrap()

      expect(retrieved_token.id).toBe(created_token.id)
    })
  })

  describe('should be able to delete', () => {
    it('a token', async () => {
      const [_, __, ___, created_token] = await setupToken(transaction)

      expect((await TokensService.deleteToken(created_token, transaction)).isOk()).toBeTruthy()

      const res = await TokensService.getTokenFromId(created_token.id, transaction)
      expect(res.isErr()).toBeTruthy()
      const error = res._unsafeUnwrapErr()

      expect(error).toBe(TokensServiceError.TokenNotFound)
    })

    it('tokens from credential', async () => {
      const [_, __, created_cred, created_token] = await setupToken(transaction)

      expect((await TokensService.deleteTokensFromCredentialId(created_cred.id, transaction)).isOk()).toBeTruthy()

      const res = await TokensService.getTokenFromId(created_token.id, transaction)
      expect(res.isErr()).toBeTruthy()
      const error = res._unsafeUnwrapErr()

      expect(error).toBe(TokensServiceError.TokenNotFound)
    })
  })

  describe("shouldn't be able to create token with an invalid", () => {
    it('client id', async () => {
      const [_, __, created_cred, ___] = await setupToken(transaction)

      expect(
        (await TokensService.generateTokenBetweenClientAndCredential(666, created_cred.id, transaction)).isErr()
      ).toBeTruthy()
    })

    it('credential id', async () => {
      const [created_client, _, __, ___] = await setupToken(transaction)

      expect(
        (await TokensService.generateTokenBetweenClientAndCredential(created_client.id, 666, transaction)).isErr()
      ).toBeTruthy()
    })
  })
})
