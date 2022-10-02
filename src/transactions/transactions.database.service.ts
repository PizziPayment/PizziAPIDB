import { ResultAsync } from 'neverthrow'
import Transaction, {
  PaymentMethod,
  TransactionAttributes,
  TransactionState,
} from '../commons/services/orm/models/transactions.database.model'
import { FindOptions, Includeable, literal, Op, OrderItem, Transaction as SequelizeTransaction } from 'sequelize'
import { ExpandedTransactionModel, intoTransactionModel, TransactionModel } from './models/transaction.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import Shop from '../commons/services/orm/models/shops.database.model'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'

export class TransactionsService {
  static getTransactionsByState(
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(Transaction.findAll({ where: { state: state }, transaction }), () =>
      PizziError.internalError()
    ).map((pizzi_transactions) => pizzi_transactions.map(intoTransactionModel))
  }

  static getOwnerTransactionsByState(
    owner_type: 'user' | 'shop',
    owner_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<Array<TransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll({ where: { state: state, [`${owner_type}_id`]: owner_id }, transaction }),
      () => PizziError.internalError()
    ).map((pizzi_transactions) => pizzi_transactions.map(intoTransactionModel))
  }

  static getOwnerExpandedTransactionsByState(
    owner_type: 'user' | 'shop',
    owner_id: number,
    state: TransactionState,
    params: ReceiptsQueryParameters,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<Array<ExpandedTransactionModel>> {
    return ResultAsync.fromPromise(
      Transaction.findAll(createShortenedQuery(owner_type, owner_id, state, params, transaction)),
      () => PizziError.internalError()
    ).map((pizzi_transactions) =>
      pizzi_transactions.map((transaction) => {
        return {
          id: transaction.id,
          state: transaction.state,
          payment_method: transaction.payment_method,
          user_id: transaction.user_id,
          shop_id: transaction.shop_id,
          receipt_id: transaction.receipt_id,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
          shop: {
            id: transaction.shop_id,
            name: transaction.shop.name,
            avatar_id: transaction.shop.avatar_id,
          },
          receipt: {
            id: transaction.receipt_id,
            total_ht: transaction.receipt.total_price,
            tva_percentage: transaction.receipt.tva_percentage,
          },
        }
      })
    )
  }

  static getTransactionById(
    id: number,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<TransactionModel> {
    return ResultAsync.fromPromise(Transaction.findOne({ where: { id: id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.TransactionNotFound, `invalid id: ${id}`)))
      .map(intoTransactionModel)
  }

  static createPendingTransaction(
    receipt_id: number,
    user_id: number | null,
    shop_id: number,
    payment_method: PaymentMethod,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<TransactionModel> {
    return ResultAsync.fromPromise(
      Transaction.create(
        {
          state: 'pending',
          user_id: user_id || undefined,
          shop_id: shop_id,
          payment_method: payment_method,
          receipt_id: receipt_id,
          created_at: new Date(),
        },
        { transaction }
      ),
      () => PizziError.internalError()
    ).map(intoTransactionModel)
  }

  static getTransactionByReceiptId(
    receipt_id: number,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<TransactionModel> {
    return ResultAsync.fromPromise(Transaction.findOne({ where: { receipt_id: receipt_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ReceiptNotFound, `invalid id: ${receipt_id}`)))
      .map(intoTransactionModel)
  }

  static updateTransactionUserIdFromId(
    transaction_id: number,
    user_id: number,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      Transaction.update({ user_id: user_id, updated_at: new Date() }, { where: { id: transaction_id }, transaction }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.TransactionNotFound, `invalid id: ${transaction_id}`)))
      .map(() => null)
  }

  static updateTransactionPaymentMethodFromId(
    transaction_id: number,
    payment_method: PaymentMethod,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      Transaction.update(
        {
          payment_method: payment_method,
          updated_at: new Date(),
        },
        {
          where: { id: transaction_id },
          transaction,
        }
      ),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.TransactionNotFound, `invalid id: ${transaction_id}`)))
      .map(() => null)
  }

  static updateTransactionStateFromId(
    transaction_id: number,
    state: TransactionState,
    transaction: SequelizeTransaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      Transaction.update({ state: state, updated_at: new Date() }, { where: { id: transaction_id }, transaction }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.TransactionNotFound, `invalid id: ${transaction_id}`)))
      .map(() => null)
  }
}

export enum Filter {
  Latest,
  Oldest,
  PriceAscending,
  PriceDescending,
}

const filter_order: Array<OrderItem> = [
  ['created_at', 'DESC'],
  ['created_at', 'ASC'],
  [literal('receipt.total_price'), 'ASC'],
  [literal('receipt.total_price'), 'DESC'],
]

export interface ReceiptsQueryParameters {
  filter?: Filter
  query?: string
  from?: Date
  to?: Date
}

function createShortenedQuery(
  owner_type: 'user' | 'shop',
  owner_id: number,
  state: TransactionState,
  params: ReceiptsQueryParameters,
  transaction: SequelizeTransaction | null = null
): FindOptions {
  const query: FindOptions<TransactionAttributes> = {
    where: { state, [`${owner_type}_id`]: owner_id },
    transaction,
  }
  const include: Array<Includeable> = [{ model: Receipt, as: 'receipt' }]
  const shop_include: Includeable = { model: Shop, as: 'shop' }

  if (params.filter !== undefined) {
    query.order = [filter_order[params.filter]]
  }

  if (params.query) {
    shop_include.where = { name: { [Op.iLike]: `%${params.query}%` } }
  }
  include.push(shop_include)
  query.include = include

  if (params.from && params.to) {
    query.where = { ...query.where, created_at: { [Op.and]: { [Op.gte]: params.from, [Op.lte]: params.to } } }
  } else if (params.from) {
    query.where = { ...query.where, created_at: { [Op.gte]: params.from } }
  } else if (params.to) {
    query.where = { ...query.where, created_at: { [Op.lte]: params.to } }
  }

  return query
}

// (Beware the) Pipeline
