export interface TokenModel {
  id: number
  access_token: string
  access_expires_at: Date
  refresh_token: string
  refresh_expires_at: Date
  client_id: number
  credential_id: number
}
