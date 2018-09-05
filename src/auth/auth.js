import {client} from '../index'

export const auth = {
  // Outdated token
  token: 'token',
  login: () => client.login(auth.token)
}
