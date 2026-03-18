// backend/strapi-config/database.js
// Copy this to: backend/strapi/config/database.js

'use strict'

const path = require('path')

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite')

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },

    // Uncomment for PostgreSQL in production:
    // postgres: {
    //   connection: {
    //     host: env('DATABASE_HOST', '127.0.0.1'),
    //     port: env.int('DATABASE_PORT', 5432),
    //     database: env('DATABASE_NAME', 'aether_blog'),
    //     user: env('DATABASE_USERNAME', 'postgres'),
    //     password: env('DATABASE_PASSWORD'),
    //     ssl: env.bool('DATABASE_SSL', false),
    //   },
    // },
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  }
}
