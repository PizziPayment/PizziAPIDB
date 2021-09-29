import { createHash } from 'crypto'

export class EncryptionService {
  static encrypt(source: string): string {
    return createHash('sha256').update(source).digest('hex')
  }
}
