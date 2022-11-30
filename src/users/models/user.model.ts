import { SmallCredentialModel } from '../../credentials/models/credential.model'

export interface UserModel {
  id: number
  firstname: string
  surname: string
  address: string
  zipcode: number
  avatar_id?: number
}

export interface UserWithCredsModel extends UserModel {
  credential: SmallCredentialModel
}
