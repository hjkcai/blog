---
title: 基于 Vue 的前端对话框解决方案
date: 2017/10/04 12:00:00
categories:
  - 技术
  - Web
tags:
  - 前端
  - Vue
  - 对话框
  - DIY
  - vue-modal-dialogs
---

<!-- github buttons start -->
<p id="github-buttons" style="display:none" align="center">
  <script async defer onload="document.getElementById('github-buttons').style.display='block'" src="https://buttons.github.io/buttons.js"></script>
  <a class="github-button" href="https://github.com/hjkcai/vue-modal-dialogs" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star hjkcai/vue-modal-dialogs on GitHub">Star</a>
  <a class="github-button" href="https://github.com/hjkcai/vue-modal-dialogs/fork" data-icon="octicon-repo-forked" data-size="large" aria-label="Fork hjkcai/vue-modal-dialogs on GitHub">Fork</a>
</p>
<!-- github buttons end -->

对话框是用户交互中很重要的一个部分，但是实现一个对话框对于前端开发人员来说却是一件不容易的事情。特别是在逻辑复杂的时候（例如一次要连续显示多组对话框），这时候就会有很多的“开关变量”和事件监听器，逻辑十分跳跃。

自从 ECMAScript 8 开始引入了基于 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的 [async 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)。利用它我们可以写出与同步代码几乎相同的异步代码。而实际上，“用户交互”也是一个异步的过程。我们可以把事件监听器看作是一个回调函数，而事件的发生就代表着回调函数被调用。

基于以上的思想，我编写了 [vue-modal-dialogs](https://github.com/hjkcai/vue-modal-dialogs) 这个库来解决这个问题。

<!-- more -->

## 简介

vue-modal-dialogs 是一个基于 [Vue.js](https://vuejs.org) 的对话框辅助库。利用 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 和 [async 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 实现快速开发对话框相关功能，同时保留极大的灵活性。

[在线演示](https://hjkcai.github.io/vue-modal-dialogs)

## 功能

* ✅ 轻量 (~1kb min+gzip)
* ✅ 基于 Promise
* ✅ 使用函数式编程思想
* ✅ 制作自己想要的对话框样式

以下功能没有包含在库中：

* ❌ 预定义的对话框样式
* ❌ 在组件中使用 `this.$xxx` 来调用对话框

## 安装

使用 [npm](https://npmjs.com) 或 [yarn](https://yarnpkg.com) 安装：

```bash
# 使用 npm
npm install vue-modal-dialogs --save

# 使用 yarn
yarn add vue-modal-dialogs
```

## 一个简单的使用例子

```javascript
// main.js

import Vue from 'vue'
import ModalDialogs from 'vue-modal-dialogs'
import MessageComponent from 'components/message.vue'

// 初始化
Vue.use(ModalDialogs)

// 使用 MessageComponent 创建一个名为 message 的对话框函数
// 这个函数的第一个参数是 title, 第二个参数是 content
const message = ModalDialogs.makeDialog(MessageComponent, 'title', 'content')

// message 函数返回一个 Promise, 所以它可以直接和 async 函数配合使用
new Vue({
  template: '<button @click="removeEverything">Click Me!</button>',
  methods: {
    async removeEverything () {
      if (await message('Warning', 'Are you sure to remove everything from your computer?')) {
        // boom!
      }
    }
  }
})
```

在 MessageComponent 中，调用 `this.$close` 函数来关闭这个消息框。你可以给这个函数传入**任意的数据**作为它唯一的参数。你也可以在组件模板中调用这个函数：

```html
<!-- MessageComponent.vue -->

<template>
  <div class="message">
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
    <button @click="$close(true)">confirm</button>
    <button @click="cancel">cancel</button>
  </div>
</template>

<script>
  export default {
    methods: {
      cancel () {
        this.$close(false)
      }
    }
  }
</script>
```

## 详细教程和 API 文档

### 初始化

```javascript
Vue.use(VueModalDialogs, { /* 可选项 */ })
```

这里有以下的可选项：

```typescript
interface PluginOptions {
  /**
   * Wrapper 元素的挂载点. 所有对话框将会被渲染进这个元素中.
   * 如果没有设置这个选项, vue-modal-dialogs 会自动创建一个挂载点.
   *
   * 默认为 undefined.
   */
  el?: HTMLElement | string,

  /**
   * Wrapper 元素的渲染选项.
   *
   * 这个选项与 VNode 的 data 对象相同.
   * 你可以传入与 transition-group 组件相同的任何参数.
   * https://cn.vuejs.org/v2/guide/render-function.html#深入-data-对象
   */
  wrapper?: WrapperRenderOptions

  /**
   * 对每个对话框的 z-index 控制选项.
   * 这个选项用于保证新的对话框显示在旧的对话框上面.
   * 将此选项设为 false 来禁用对 z-index 属性的控制.
   */
  zIndex?: {
    /** z-index 的初始值. 默认为 1000. */
    value?: number,

    /** 表示当新的对话框出现时是否递增 z-index. 默认为 true */
    autoIncrement?: boolean
  }
}
```

### 对话框函数

<blockquote class="blockquote-center"><strong>对话框函数就是一个返回 Promise 的普通函数。</strong></blockquote>

调用 `makeDialog` 函数来生成一个对话框函数。你可以通过 `ModalDialogs.makeDialogs` 来调用它，或者先这样引入 `makeDialog` 函数后再调用：

```javascript
import { makeDialog } from 'vue-modal-dialogs'
```

下面是 makeDialog 函数的使用方法和参数说明：

```typescript
function makeDialog (component: VueComponent, ...props: string[]): DialogFunction
function makeDialog (options: DialogOptions): DialogFunction
```

```typescript
interface DialogOptions {
  /** 用作“对话框组件”的 Vue 组件 */
  component: DialogComponent,

  /** 表示函数参数将如何映射到组件 props 的数组 */
  props: string[],

  /**
   * 对话框组件渲染选项
   * https://cn.vuejs.org/v2/guide/render-function.html#深入-data-对象
   */
  render?: Vue.VNodeData
}
```

其中，`props` 选项最为重要。**它表示的是对话框函数参数和对话框组件属性的映射**。举个例子，当 `props` 被设置为 `['title', 'content']` 时，使用下面的代码调用对话框函数：

```javascript
dialogFunction('This is title', 'This is content', 'Extra argument')
```

对话框组件将会接收到以下的属性（其中 `title` 和 `content` 是配对成功的属性）：

```javascript
{
  title: 'This is title',       // 第一个参数
  content: 'This is content',   // 第二个参数
  dialogId: 0,                  // 当前对话框的唯一标示符
  // 保存所有参数
  arguments: ['This is title', 'This is content', 'Extra argument']
}
```

另外，`makeDialog` 函数是一个*纯函数*。它不会修改传入的 Vue 组件，而是生成一个*扩展*了原对话框组件的副本。你可以在项目的其它地方直接原样使用原来的对话框组件。有关组件扩展的更多信息请[点击此处](https://cn.vuejs.org/v2/api/#extends)。

### 对话框组件

当对话框函数被调用时，对话框组件将会在页面上出现。这个组件的外观完全由你自己来设计，或者你也可以使用第三方组件库中提供的对话框。

调用对话框函数时会传入一些额外的参数，通过对话框组件的 props 来接收这些参数。vue-modal-dialogs 会自动定义这些 props。除非你需要使用 [prop 验证](https://cn.vuejs.org/v2/guide/components.html#Prop-验证)，否则你不需要额外定义这些 props。

```javascript
export default {
  // 这是函数的两个参数. 当你需要使用 prop 验证时才需要额外定义它们.
  props: {
    title: String,
    content: String
  },
  ...
}
```

另外，以下两个属性会被自动加入对话框组件中:

1. `arguments`: 保存对话框函数所有参数的数组。
2. `dialogId`: 当前对话框的唯一标示符。这是 vue-modal-dialogs 的一个内部参数。

vue-modal-dialogs 会向对话框组件中添加一个 `$close` 函数。当用户操作结束时（如用户按下了确定按钮）调用这个函数，并把要返回的输出作为这个函数的唯一参数。这个函数会使当前对话框关闭，并 resolve 先前由对话框函数创建的 Promise。

```javascript
this.$close(data)       // data 是可选的
```

你可以创建多个对话框组件，并用它们来生成对话框函数。

## 贡献

如果你对 vue-modal-dialogs 有意见或者建议，欢迎在 github 上开 issue 或 PR！

<a class="github-button" href="https://github.com/hjkcai/vue-modal-dialogs/issues" data-icon="octicon-issue-opened" data-size="large" aria-label="Issue hjkcai/vue-modal-dialogs on GitHub">Issue</a>
<a class="github-button" href="https://github.com/hjkcai/vue-modal-dialogs/fork" data-icon="octicon-repo-forked" data-size="large" aria-label="Fork hjkcai/vue-modal-dialogs on GitHub">Fork</a>

## 运行开发版本

```bash
# use npm
npm run dev

# use yarn
yarn dev
```

## 构建生产版本

```bash
# use npm
npm run build

# use yarn
yarn build
```

