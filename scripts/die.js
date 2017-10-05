'use strict'

process.on('unhandledRejection', error => {
  // 在出现 Unhandled Promise Rejection 时直接报错退出
  console.error('ERR   unhandledRejection')
  console.error((error && error.stack) || error)
  process.exit(1)
})
