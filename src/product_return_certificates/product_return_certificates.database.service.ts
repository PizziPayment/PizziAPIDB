import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'
import { ResultAsync } from 'neverthrow'
import ProductReturnCertificatesModel from './models/product_return_certificates.model'
import { ProductReturnCertificates } from '../commons/services/orm/models/product_return_certificates.database.model'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

export type ProductReturnCertificatesServiceResult<T> = ResultAsync<T, IPizziError>

export class ProductReturnCertificatesService {
  static getProductReturnCertificateFromReceiptItemId(
    receipt_item_id: number,
    transaction: Transaction | null = null
  ): ProductReturnCertificatesServiceResult<ProductReturnCertificatesModel> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.findOne({ where: { receipt_item_id: receipt_item_id }, transaction }),
      () => PizziError.internalError()
    ).andThen(
      okIfNotNullElse(new PizziError(ErrorCause.ReceiptItemNotFound, `invalid receipt_item_id: ${receipt_item_id}`))
    )
  }

  static createProductReturnCertificateFromReceiptItemId(
    receipt_item_id: number,
    returned_quantity: number,
    transaction: Transaction | null = null
  ): ProductReturnCertificatesServiceResult<ProductReturnCertificatesModel> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.create(
        { receipt_item_id: receipt_item_id, quantity: returned_quantity, return_date: new Date() },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static updateProductReturnCertificateQuantityFromReceiptItemId(
    receipt_item_id: number,
    new_returned_quantity: number,
    transaction: Transaction | null = null
  ): ProductReturnCertificatesServiceResult<null> {
    return ResultAsync.fromPromise(
      ProductReturnCertificates.update(
        { quantity: new_returned_quantity, return_date: new Date() },
        { where: { receipt_item_id: receipt_item_id }, transaction }
      ),
      () => PizziError.internalError()
    ).map(() => null)
  }
}
