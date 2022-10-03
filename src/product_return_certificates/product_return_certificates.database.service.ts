import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'
import { ResultAsync } from 'neverthrow'
import {
  ProductReturnCertificateModel,
  ProductReturnDetailedCertificateModel,
} from './models/product_return_certificates.model'
import ProductReturnCertificates from '../commons/services/orm/models/product_return_certificates.database.model'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'

export class ProductReturnCertificatesService {
  static getProductReturnCertificatesFromReceiptId(
    receipt_id: number,
    transaction: Transaction | null = null
  ): PizziResult<Array<ProductReturnCertificateModel>> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.findAll({
        include: [{ model: ReceiptItem, attributes: ['receipt_id'], where: { receipt_id: receipt_id } }],
        transaction,
      }),
      () => PizziError.internalError()
    )
  }

  static getProductReturnCertificateFromId(
    id: number,
    transaction: Transaction | null = null
  ): PizziResult<ProductReturnCertificateModel> {
    return ResultAsync.fromPromise(ProductReturnCertificates.findOne({ where: { id: id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(
      okIfNotNullElse(
        new PizziError(ErrorCause.ProductReturnCertificateNotFound, `invalid product_return_certificate_id: ${id}`)
      )
    )
  }

  static getProductReturnCertificateFromReceiptItemId(
    receipt_item_id: number,
    transaction: Transaction | null = null
  ): PizziResult<ProductReturnCertificateModel | null> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.findOne({ where: { receipt_item_id: receipt_item_id }, transaction }),
      () => PizziError.internalError()
    )
  }

  static getProductReturnDetailedCertificateFromReceiptItemId(
    receipt_item_id: number,
    transaction: Transaction | null = null
  ): PizziResult<ProductReturnDetailedCertificateModel> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.findOne({
        where: { receipt_item_id: receipt_item_id },
        include: [{ model: ReceiptItem }],
        transaction,
      }),
      () => PizziError.internalError()
    ).andThen(
      okIfNotNullElse(new PizziError(ErrorCause.ReceiptItemNotFound, `invalid receipt_item_id: ${receipt_item_id}`))
    )
  }

  static createProductReturnCertificateFromReceiptItemId(
    receipt_item_id: number,
    reason: string,
    returned_quantity: number,
    transaction: Transaction | null = null
  ): PizziResult<ProductReturnCertificateModel> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.create(
        { receipt_item_id: receipt_item_id, reason: reason, quantity: returned_quantity, return_date: new Date() },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static updateProductReturnCertificateQuantityFromReceiptItemId(
    receipt_item_id: number,
    new_returned_quantity: number,
    new_reason: string,
    transaction: Transaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.update(
        { quantity: new_returned_quantity, reason: new_reason, return_date: new Date() },
        { where: { receipt_item_id: receipt_item_id }, transaction }
      ),
      () => PizziError.internalError()
    ).map(() => null)
  }
}
