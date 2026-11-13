import { api } from '@/lib/api'

import type { CreateClientConfig } from './generated/client.gen'

/**
 * Called by the generated client on initialization. Passing the shared axios
 * instance keeps the auth and refresh interceptors on every SDK call.
 */
export const createClientConfig: CreateClientConfig = (override) => ({
  ...override,
  axios: api,
})
