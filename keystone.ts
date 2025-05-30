// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import 'dotenv/config'

import { config } from '@keystone-6/core'

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema'

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth'


const {
  DB_URL,
  DB_USERNAME,
  DB_PASSWORD
} = process.env

export default withAuth(
  config({
    server: {
      cors: {
        origin: ['http://localhost:3000', 'https://prep-presales.surge.sh', 'https://reports-prep-presales.surge.sh', 'http://localhost:5173'],
        credentials: true
      }
    },
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'postgresql',
      
      url: `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}:5432/keystone`,
    },
    lists,
    session,
  })
)
