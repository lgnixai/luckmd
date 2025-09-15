import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { pluginManager } from '../lib/plugin-manager-simple'

// 导航项类型定义
export interface NavItem {
  id: string
  title: string
  description?: string
  icon: any
  isActive: boolean
  url?: string
  component?: any
  routes?: any[]
}

// 导航状态类型
interface NavState {
  navMain: NavItem[]
  activeItem: NavItem | null
  
  // Actions
  setActiveItem: (item: NavItem | null) => void
  setActiveItemByTitle: (title: string) => void
  setActiveItemById: (id: string) => void
  updateNavMain: (plugins: any[]) => void
  initializeNavFromPlugins: () => void
}

export const useNavStore = create<NavState>()(
  devtools(
    (set) => ({
      // 初始导航数据 - 使用插件管理器获取所有插件
      navMain: pluginManager.getPlugins()
        .filter(plugin => plugin.config?.showInNav !== false && plugin.config?.enabled)
        .sort((a, b) => (a.config?.position || 0) - (b.config?.position || 0))
        .map((plugin, index) => ({
          id: plugin.id,
          title: plugin.name,
          description: plugin.description,
          icon: plugin.icon,
          isActive: index === 0, // 第一个插件默认激活
          url: "#",
          component: plugin.component,
          routes: plugin.routes
        })),
      activeItem: null,

      // Actions
      setActiveItem: (item: NavItem | null) => 
        set((state) => ({
          navMain: state.navMain.map(navItem => ({
            ...navItem,
            isActive: item ? navItem.id === item.id : false
          })),
          activeItem: item
        }), false, 'setActiveItem'),
      
      setActiveItemByTitle: (title: string) => 
        set((state) => {
          const item = state.navMain.find(navItem => navItem.title === title)
          if (item) {
            return {
              navMain: state.navMain.map(navItem => ({
                ...navItem,
                isActive: navItem.title === title
              })),
              activeItem: item
            }
          }
          return state
        }, false, 'setActiveItemByTitle'),
      
      setActiveItemById: (id: string) => 
        set((state) => {
          const item = state.navMain.find(navItem => navItem.id === id)
          if (item) {
            return {
              navMain: state.navMain.map(navItem => ({
                ...navItem,
                isActive: navItem.id === id
              })),
              activeItem: item
            }
          }
          return state
        }, false, 'setActiveItemById'),
      
      updateNavMain: (plugins: any[]) => 
        set(() => ({
          navMain: plugins
            .filter(plugin => plugin.config?.showInNav !== false && plugin.config?.enabled)
            .sort((a, b) => (a.config?.position || 0) - (b.config?.position || 0))
            .map((plugin) => ({
              id: plugin.id,
              title: plugin.name,
              description: plugin.description,
              icon: plugin.icon,
              isActive: false,
              url: "#",
              routes: plugin.routes, // 添加路由信息
              config: plugin.config
            }))
        }), false, 'updateNavMain'),
      
      initializeNavFromPlugins: () => 
        set(() => ({
          navMain: pluginManager.getPlugins()
            .filter(plugin => plugin.config?.showInNav !== false && plugin.config?.enabled)
            .sort((a, b) => (a.config?.position || 0) - (b.config?.position || 0))
            .map((plugin, index) => ({
              id: plugin.id,
              title: plugin.name,
              description: plugin.description,
              icon: plugin.icon,
              isActive: index === 0, // 第一个插件默认激活
              url: "#",
              component: plugin.component,
              routes: plugin.routes
            }))
        }), false, 'initializeNavFromPlugins')
    }),
    {
      name: 'nav-store', // 用于 Redux DevTools
    }
  )
)

// 选择器 hooks
export const useNavMain = () => useNavStore((state) => state.navMain)
export const useActiveNavItem = () => useNavStore((state) => state.activeItem)
