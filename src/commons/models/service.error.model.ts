export enum ErrorCause {
  DatabaseError = 0,
  TransactionNotFound,
  TransactionTokenNotFound,
  ShopNotFound,
  UserNotFound,
  TokenNotFound,
  ShopItemNotFound,
  ReceiptNotFound,
  ReceiptItemNotFound,
  CredentialNotFound,
  DuplicatedEmail,
  ClientNotFound,
  InvalidPrice,
}

export interface IPizziError {
  source: string
  message: string
  code: ErrorCause
}

export class PizziError implements IPizziError {
  source: string = 'Unknown'
  message: string
  code: ErrorCause

  constructor(code: ErrorCause, message: string) {
    this.source = PizziError.getCallersName(3)
    this.message = `${PizziError.getErrorCauseMessage(code)}: ${message}`
    this.code = code
  }

  static getErrorCauseMessage(cause: ErrorCause): string {
    return [
      'Database error',
      'Transaction not found',
      'Transaction token not found',
      'Shop not found',
      'User not found',
      'Token not found',
      'Shop item not found',
      'Receipt not found',
      'Receipt item not found',
      'Credential not found',
      'Duplicated email',
      'Client not found',
    ][cause]
  }

  static internalError(): PizziError {
    return {
      source: PizziError.getCallersName(3),
      message: 'Internal error.',
      code: ErrorCause.DatabaseError,
    }
  }

  private static getCallersName(depth: number): string {
    const err = new Error()

    if (err.stack) {
      // This parse the callstack to find the function that call the class' constructor
      const func_name = /at \w+\.(\w+)/.exec(err.stack.split('\n')[depth])
      if (func_name) {
        return func_name[1]
      }
    }
    return 'Unknown'
  }
}
