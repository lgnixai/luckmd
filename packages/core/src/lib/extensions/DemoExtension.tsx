// import React from 'react'
import { Extension } from './types'
import { globalSlots } from '../core/slots'

export const DemoExtension: Extension = {
  id: 'demo-extension',
  activate(ctx: any) {
    const commands = ctx.commands
    const logger = ctx.logger

    commands.register('demo.sayHello', (name?: string) => {
      logger.info('[demo.sayHello]', name || 'LuckMD')
      return `Hello ${name || 'LuckMD'}`
    })

    // 注册一个插槽组件到 sidebar 底部
    globalSlots.register('sidebar.footer', () => (
      <div className="p-2 text-xs text-muted-foreground">DemoExtension loaded</div>
    ))

    // 注册右侧边栏内容
    globalSlots.register('right-sidebar.content', () => (
      <div className="space-y-2">
        <div className="p-2 bg-accent rounded text-xs">
          <strong>Demo 扩展</strong>
          <p className="mt-1">这是一个演示扩展，展示如何向右侧边栏添加内容。</p>
        </div>
        <div className="p-2 border rounded text-xs">
          <p><strong>功能:</strong> 右侧边栏演示</p>
          <p><strong>状态:</strong> 已激活</p>
        </div>
        <div className="p-2 bg-blue-50 rounded text-xs">
          <p><strong>可用插槽:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• sidebar.footer</li>
            <li>• right-sidebar.content</li>
            <li>• right-sidebar.footer</li>
          </ul>
        </div>
      </div>
    ))

    // 注册右侧边栏底部
    globalSlots.register('right-sidebar.footer', () => (
      <div className="p-2 text-xs text-muted-foreground border-t">
        DemoExtension 右侧面板
      </div>
    ))
  },
}


