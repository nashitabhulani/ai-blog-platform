// backend/strapi-config/post-controller.js
// Copy this to: backend/strapi/src/api/post/controllers/post.js
//
// Extends the default Strapi post controller with:
// - View counter increment
// - Related posts endpoint

'use strict'

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  // Override findOne to increment view count
  async findOne(ctx) {
    const { id } = ctx.params

    // Find by slug if id looks like a slug (contains letters)
    let post
    if (isNaN(id)) {
      const results = await strapi.entityService.findMany('api::post.post', {
        filters: { slug: id },
        populate: ['featuredImage', 'category', 'tags'],
        limit: 1,
      })
      post = results?.[0]
    } else {
      post = await strapi.entityService.findOne('api::post.post', id, {
        populate: ['featuredImage', 'category', 'tags'],
      })
    }

    if (!post) {
      return ctx.notFound('Post not found')
    }

    // Increment views asynchronously (don't await — don't block response)
    strapi.entityService
      .update('api::post.post', post.id, {
        data: { views: (post.views || 0) + 1 },
      })
      .catch(() => {}) // Silently fail if update fails

    return this.transformResponse(post)
  },

  // GET /api/posts/:id/related
  async related(ctx) {
    const { id } = ctx.params

    const post = await strapi.entityService.findOne('api::post.post', id, {
      populate: ['category'],
    })

    if (!post) return ctx.notFound()

    const related = await strapi.entityService.findMany('api::post.post', {
      filters: {
        id: { $ne: post.id },
        status: 'published',
        ...(post.category?.id && { category: post.category.id }),
      },
      populate: ['featuredImage', 'category'],
      limit: 3,
      sort: 'publishedAt:desc',
    })

    return this.transformResponse(related)
  },
}))
