import { Transaction } from 'sequelize'

export function onTransaction<T, R>(
  transaction: Transaction | null,
  f: (model: T, transaction: Transaction | null) => R
): (model: T) => R {
  return (model) => f(model, transaction)
}
