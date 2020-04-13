import { config } from 'dotenv'

config()

let path: string
switch (process.env.NODE_ENV) {
  case 'production': {
    path = './.env.production'
    break
  }
  case 'test':
  case 'testing': {
    path = './.env.test'
    break
  }
  default: {
    path = './.env.development'
    break
  }
}

config({ path: path })
