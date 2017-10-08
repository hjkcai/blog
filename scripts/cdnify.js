/* globals hexo */
'use strict'

const cheerio = require('cheerio')

const metas = [
  'meta[name="twitter:image"]',
  'meta[property="og:image"]'
]

hexo.extend.filter.register('before_generate', () => {
  if (process.env.NODE_ENV === 'production') {
    hexo.config.cdn.enable = true
    hexo.theme.config.css = 'https://cdn.huajingkun.com/css'
    hexo.theme.config.js = 'https://cdn.huajingkun.com/js'
    hexo.theme.config.images = 'https://cdn.huajingkun.com/images'

    hexo.extend.filter.register('after_render:html', html => {
      const $ = cheerio.load(html, { _useHtmlParser2: true, decodeEntities: false })
      metas.forEach(metaSelector => {
        $(metaSelector).attr('content', (i, content) => {
          return content.replace('https://huajingkun.com', 'https://cdn.huajingkun.com')
        })
      })

      return $.html()
    })
  }
})
