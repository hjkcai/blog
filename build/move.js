'use strict'

const glob = require('glob')
const shell = require('shelljs')

glob
  .sync('./source/_posts/**/*.md')
  .filter(file => /(.*)\/\1.md$/.test(file))
  .map(file => ({ file, dest: file.replace(/(.*)\/(.*)\/\2.md$/, '$1/$2.md') }))
  .forEach(data => {
    shell.mv(data.file, data.dest)
  })
