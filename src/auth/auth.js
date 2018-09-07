import {client} from '../index'

export const auth = {
  token: 'NDg2NjA4NDc0NjI1NTQwMTA2.DnRCbQ.4qjcmPp0NEjd9EAkHgNto7PMIAM',
  login: () => client.login(auth.token)
}