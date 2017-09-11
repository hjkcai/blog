/* globals hexo */
'use strict'

const cheerio = require('cheerio')

const metas = [
  'meta[name="twitter:image"]',
  'meta[property="og:image"]'
]

hexo.extend.filter.register('before_generate', () => {
  hexo.extend.filter.register('after_render:html', html => {
    const $ = cheerio.load(html)
    metas.forEach(metaSelector => {
      $(metaSelector).attr('content', (i, content) => {
        return content.replace('https://huajingkun.com', 'https://cdn.huajingkun.com')
      })
    })

    return $.html({ decodeEntities: false })
  })
})
