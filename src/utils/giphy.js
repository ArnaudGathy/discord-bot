import auth from '../constants/auth.json'
import axios from 'axios'

const HOST = 'api.giphy.com/v1/gifs'
const KEY = `api_key=${auth.token.giphy}`

const endpoints = {
  RANDOM: {
    action: 'get',
    path: 'random',
  },
}

const getUrl = endpoint => `https://${HOST}/${endpoint.path}?${KEY}`

export const getRandomGif = async filter => {
  const endpoint = endpoints.RANDOM
  let url = getUrl(endpoint)
  if (filter) {
    url = `${url}&tag=${filter}`
  }

  const {
    data: {
      data: {embed_url: gif},
    },
  } = await axios[endpoint.action](url)
  return gif
}
