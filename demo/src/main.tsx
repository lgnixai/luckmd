import React from 'react'
import ReactDOM from 'react-dom/client'
import './globals.css'
import { create } from '@luckmd/ui'
import { DemoExtension } from '@luckmd/core'
import { adaptBlueMDPlugin } from '@luckmd/core'
import { MovieSearchSidebar } from '@luckmd/plugins'
import { MovieSearchResults } from '@luckmd/plugins'
import { RSSSidebar } from '@luckmd/plugins'
import { RSSContent } from '@luckmd/plugins'
import { Film, Rss } from 'lucide-react'

const instance = create({
  plugins: Promise.resolve([
    adaptBlueMDPlugin('movie-data', '电影数据', MovieSearchSidebar as any, MovieSearchResults as any, Film as any),
    adaptBlueMDPlugin('rss-reader', 'RSS 阅读器', (props: any) => <RSSSidebar mode="list-only" {...props} />, RSSContent as any, Rss as any),
  ]),
  extensions: [DemoExtension],
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div id="luckmd-root" />
  </React.StrictMode>
)

// 确保 DOM 加载完成后立即渲染
const renderLuckMD = () => {
  const container = document.getElementById('luckmd-root')
  if (container) {
    ;(window as any).__luckmd = instance
    try {
      instance.render(container)
    } catch (e) {
      console.error('luckmd render error', e)
      container.innerHTML = '<div style="padding:12px;color:red">LuckMD render error</div>'
    }
  } else {
    // 如果容器还没准备好，等待一下再试
    setTimeout(renderLuckMD, 10)
  }
}

// 立即尝试渲染
renderLuckMD()
