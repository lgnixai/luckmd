import { Plugin } from '../../types/plugin'
import { RssIcon } from './assets/rss-icon'
import { RSSComponent } from './components/RSSComponent'

export const rssPlugin: Plugin = {
  id: 'rss-reader',
  name: 'RSS阅读器',
  description: 'RSS源管理和文章阅读',
  version: '1.0.0',
  author: 'BlueMD Team',
  icon: RssIcon,
  component: RSSComponent,
  category: '工具',
  config: {
    position: 3,
    showInNav: true,
    enabled: true
  },
  lifecycle: {
    onInstall: () => {
      console.log('RSS阅读器插件已安装')
    },
    onEnable: () => {
      console.log('RSS阅读器插件已启用')
    },
    onDisable: () => {
      console.log('RSS阅读器插件已禁用')
    }
  },
  menu: [
    {
      id: 'rss-reader',
      label: 'RSS阅读器',
      path: '/rss',
      icon: RssIcon,
      action: 'navigate'
    }
  ]
}

export default rssPlugin