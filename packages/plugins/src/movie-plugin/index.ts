import { Plugin } from '../../types/plugin'
import { MovieIcon } from './assets/movie-icon'
import { MovieSearchInterface } from './components/MovieSearchInterface'
import { TestComponent } from './components/TestComponent'

export const moviePlugin: Plugin = {
  id: 'movie-data',
  name: '电影数据',
  description: '展示和管理电影数据，包括采集任务状态',
  version: '1.0.0',
  author: 'BlueMD Team',
  icon: MovieIcon,
  category: '数据管理',
  component: MovieSearchInterface,
  config: {
    position: 2,
    showInNav: true,
    enabled: true
  },
  lifecycle: {
    onInstall: () => {
      console.log('电影数据插件已安装')
    },
    onEnable: () => {
      console.log('电影数据插件已启用')
    },
    onDisable: () => {
      console.log('电影数据插件已禁用')
    }
  },
  // 移除路由，通过JavaScript控制显示
  menu: [
    {
      id: 'movie-data',
      label: '电影数据',
      path: '/movies',
      icon: MovieIcon,
      action: 'navigate'
    }
  ]
}

export default moviePlugin
