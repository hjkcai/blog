'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const cheerio = require('cheerio')

// 将 url 解析到正确位置
function resolveUrl (url, file) {
  if (!url.includes('//') && !url.startsWith('data:')) {
    return path.resolve('/article', file.replace('./source/_posts/', ''), '..', url)
  }

  return url
}

// https://github.com/zqjimlove/hexo-cdnify/blob/master/lib/cdnify.js
const tagAttrs = {
  'img[data-src]': 'data-src',
  'img[src]': 'src',
  'link[rel="apple-touch-icon"]': 'href',
  'link[rel="icon"]': 'href',
  'link[rel="shortcut icon"]': 'href',
  'link[rel="stylesheet"]': 'href',
  'script[src]': 'src',
  'source[src]': 'src',
  'video[poster]': 'poster'
}

glob
  .sync('./source/_posts/**/*.md')
  .filter(file => /(.*)\/\1.md$/.test(file))
  .map(file => ({ file, dest: file.replace(/(.*)\/(.*)\/\2.md$/, '$1/$2.md') }))
  .forEach(({ file, dest }) => {
    let html = fs.readFileSync(file).toString()

    // 保证代码块中的 html 正常
    html = html.replace(/```.*\n([^]*?)```/g, (substring, args) => {
      return substring.replace(/</g, '&lt;')
    })

    if (process.env.NODE_ENV === 'production') {
      // 读取 markdown 并修改图片标记（![]()）中的 url
      html = html.replace(/!\[(.*)\]\((.*)\)/g, (str, alt, url) => `![${alt}](${resolveUrl(url, file)})`)
      const $ = cheerio.load(html)

      // 遍历资源标签并修改其中的 url
      Object.keys(tagAttrs).forEach(selector => {
        const attr = tagAttrs[selector]
        const elements = $(selector)
        elements.attr(attr, (index, attrValue) => resolveUrl(attrValue, file))
      })

      // 由于输入的是 markdown 文件
      // cheerio 在生成 html 时会自动在开头结尾添加一些标签
      // 这里要把这些标签都去掉
      html = $.html({ decodeEntities: false }).replace(/^<html><head><\/head><body>/, '').replace(/<\/body><\/html>$/, '')
    }

    // 将文件写入新的位置, 并删除原来的文件
    fs.writeFileSync(dest, html)
    fs.unlinkSync(file)
  })
