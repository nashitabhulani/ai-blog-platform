// backend/strapi-config/post-routes.js
// Copy this to: backend/strapi/src/api/post/routes/post.js

'use strict'

const { createCoreRouter } = require('@strapi/strapi').factories

// Default CRUD routes + custom related posts route
module.exports = {
  routes: [
    // Default Strapi CRUD routes
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'post.findOne',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'post.update',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'post.delete',
      config: { policies: [], middlewares: [] },
    },

    // Custom: related posts
    {
      method: 'GET',
      path: '/posts/:id/related',
      handler: 'post.related',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // public
      },
    },
  ],
}
