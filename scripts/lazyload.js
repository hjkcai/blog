/* globals hexo */
'use strict'

const fs = require('mz/fs')
const url = require('url')
const path = require('path')
const sharp = require('sharp')
const cheerio = require('cheerio')

hexo.extend.filter.register('after_render:html', async html => {
  const $ = cheerio.load(html)
  const permalink = url.parse($('link[rel=canonical]').attr('href'))

  // 只转换文章中的图片
  if (permalink.pathname.startsWith('/article')) {
    const pathPrefix = path.resolve(__dirname, '../source/_posts', permalink.pathname.replace('/article/', ''))
    const imgEls = $('article.post .post-body img')

    for (let i = 0; i < imgEls.length; i++) {
      const $el = $(imgEls[i])
      const imageUrl = $el.attr('src')

      // 如果该 img 元素有 src 属性并且 src 属性是一个相对 url
      // 而且该元素的 data-src 属性没有被设置 (不覆盖已有的 lazyload 设置)
      // 则应用 lazyload 设置
      if (imageUrl && !$el.attr('data-original') && !imageUrl.includes('//') && !imageUrl.startsWith('data:')) {
        const imagePath = path.join(pathPrefix, imageUrl)
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

  return $.html({ decodeEntities: false })
}, 0 /* 保证在其它 filter 之前执行 */)
