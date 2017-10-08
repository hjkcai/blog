/* globals hexo */
'use strict'

const fs = require('mz/fs')
const url = require('url')
const path = require('path')
const sharp = require('sharp')
const cheerio = require('cheerio')

hexo.extend.filter.register('after_render:html', async html => {
  const $ = cheerio.load(html, { _useHtmlParser2: true, decodeEntities: false })
  const href = $('link[rel=canonical]').attr('href')
  if (typeof href !== 'string' || !href) {
    return html
  }

  const permalink = url.parse(href)

  // 只转换文章中的图片
  if (permalink.pathname.startsWith('/article')) {
    const imgEls = $('article.post .post-body img')
    let pathPrefix = path.resolve(__dirname, '../source/_posts')

    // 生产环境下会先执行 resolve-url.js 中的路径解析
    // 所以在生产环境下不能加上 permalink.pathname
    if (process.env.NODE_ENV === 'development') {
      pathPrefix = path.join(pathPrefix, permalink.pathname.replace(/^\/article\//, ''))
    }

    for (let i = 0; i < imgEls.length; i++) {
      const $el = $(imgEls[i])
      const imageUrl = $el.attr('src')

      // 如果该 img 元素有 src 属性并且 src 属性是一个相对 url
      // 而且该元素的 data-src 属性没有被设置 (不覆盖已有的 lazyload 设置)
      // 则应用 lazyload 设置
      if (imageUrl && !$el.attr('data-original') && !imageUrl.includes('//') && !imageUrl.startsWith('data:')) {
        const imagePath = path.join(pathPrefix, imageUrl.replace(/^\/article\//, ''))
        if (await fs.exists(imagePath)) {
          const image = sharp(imagePath)
          const metadata = await image.metadata()

          // 设置图片的宽高
          $el.attr('width', metadata.width).attr('height', metadata.height)

          // 生成模糊并缩小后的副本
          const blurredImage = await image.blur().resize(200).jpeg().toBuffer()
          $el.attr('src', `data:image/jpeg;base64,${blurredImage.toString('base64')}`)

          // 设置 lazyload
          $el.attr('data-original', imageUrl)
        }
      }
    }
  }

  return $.html()
}, 0 /* 保证在其它 filter 之前执行 */)
