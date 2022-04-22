import { CredentialModel } from '../../src/index'

export const credential: Omit<CredentialModel, 'id'> = {
  email: 'email@example.com',
  password: 'password',
}

export const shop = {
  name: 'toto',
  phone: '0652076382',
  address: '13 rue de la ville Ville',
  zipcode: 25619,
}
