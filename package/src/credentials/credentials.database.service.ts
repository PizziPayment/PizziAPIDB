import { err, ok, Result } from 'neverthrow'
import Credential, { CredentialCreation } from '../commons/services/orm/models/credentials.database.model'
import Token from '../commons/services/orm/models/tokens.database.model'
import { CredentialModel } from './models/credential.model'

export type CredentialsServiceResult<T> = Result<T, CredentialsServiceError>

export enum CredentialsServiceError {
  DuplicatedEmail,
  OwnerNotFound,
  DatabaseError,
}

export class CredentialsService {
  static async deleteCredentialFromId(credential_id: number): Promise<CredentialsServiceResult<null>> {
    try {
      const credential = await Credential.findOne({ where: { id: credential_id } })

      if (!credential) {
        return err(CredentialsServiceError.OwnerNotFound)
      } else {
        const tokens = await Token.findAll({ where: { credential_id: credential_id } })

        await Promise.all(tokens.map((tok) => tok.destroy()))
        await credential.destroy()
        return ok(null)
      }
    } catch (e) {
      console.log(e)
      return err(CredentialsServiceError.DatabaseError)
    }
  }

  static async getCredentialFromId(credential_id: number): Promise<CredentialsServiceResult<CredentialModel>> {
    try {
      const credential = await Credential.findOne({ where: { id: credential_id } })

      if (!credential) {
        return err(CredentialsServiceError.OwnerNotFound)
      } else {
        return ok(credential)
      }
    } catch {
      return err(CredentialsServiceError.DatabaseError)
    }
  }

  static async createCredentialWithId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    email: string,
    password: string
  ): Promise<CredentialsServiceResult<CredentialModel>> {
    try {
      const id_key: 'user_id' | 'shop_id' | 'admin_id' = `${id_type}_id`
      const credential_attr: CredentialCreation = {
        email: email,
        password: password,
        [id_key]: id,
      }
      const credential = await Credential.create(credential_attr)

      return ok(credential)
    } catch {
      return err(CredentialsServiceError.DatabaseError)
    }
  }

  static async isEmailUnique(email: string): Promise<CredentialsServiceResult<null>> {
    try {
      const owner = await Credential.findOne({ where: { email: email } })

      if (!owner) {
        return ok(null)
      } else {
        return err(CredentialsServiceError.DuplicatedEmail)
      }
    } catch {
      return err(CredentialsServiceError.DatabaseError)
    }
  }
}
