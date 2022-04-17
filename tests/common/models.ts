import { UserModel, ShopModel, CredentialModel } from '../../src/index'

export const credential: Omit<CredentialModel, 'id'> = {
  email: 'email@example.com',
  password: 'password',
}

export const shop: Omit<ShopModel, 'id'> = {
  name: 'toto',
  phone: '0652076382',
  address: '13 rue de la ville Ville',
  zipcode: 25619,
}

export const user: Omit<UserModel, 'id'> = {
  firstname: 'Precaire',
  surname: 'Valerie',
  address: '238 rue de Vaugirard',
  zipcode: 75015,
}
