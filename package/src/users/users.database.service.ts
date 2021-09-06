import { err, ok, Result } from 'neverthrow'
import UserModel from './models/user.model'
import User from '../commons/services/orm/models/user.database.model'

export type UsersServiceResult<T> = Result<T, UsersServiceError>

export enum UsersServiceError {
  DatabaseError,
  UserNotFound,
}

export default class UsersServices {
  static async deleteUserById(user_id: number): Promise<UsersServiceResult<null>> {
    try {
      const user = await User.findOne({ where: { id: user_id } })

      if (!user) {
        return err(UsersServiceError.UserNotFound)
      } else {
        await user.destroy()
        return ok(null)
      }
    } catch {
      return err(UsersServiceError.DatabaseError)
    }
  }

  static async createUser(
    name: string,
    surname: string,
    address: string,
    zipcode: number
  ): Promise<UsersServiceResult<UserModel>> {
    try {
      const user = await User.create({
        address: address,
        firstname: name,
        surname: surname,
        zipcode: zipcode,
        picture_id: undefined,
      })

      return ok(user)
    } catch {
      return err(UsersServiceError.DatabaseError)
    }
  }
}
