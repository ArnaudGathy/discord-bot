import {client} from '../index'

export const auth = {
  token: 'NDg2NjA4NDc0NjI1NTQwMTA2.DnBpQg.O4BWjNRswq142lwIVH999C86suU',
  login: () => client.login(auth.token)
}