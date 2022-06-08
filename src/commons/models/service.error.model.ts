export enum ErrorCause {
  DatabaseError,
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
}

export interface IPizziError {
  source: string
  message: string
  code: number
}

export class PizziError implements IPizziError {
  source: string = 'Unknown'
  message: string
  code: number

  constructor(message: string, code: ErrorCause) {
    this.source = PizziError.getCallersName(3)
    this.message = message
    this.code = code
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
