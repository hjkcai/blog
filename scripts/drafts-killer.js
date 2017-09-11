/* globals hexo */
'use strict'

if (process.env.NODE_ENV === 'production') {
  hexo.extend.filter.register('before_generate', () => {
    return hexo.database._models.Post.remove({ draft: true })
  })
}
