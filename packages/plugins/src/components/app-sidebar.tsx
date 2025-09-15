"use client"

import * as React from "react"
import { Command, Settings } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
    MultiSidebar,
    useLeftSidebar,
} from "@/components/ui/multi-sidebar"
import { useNavMain, useNavStore } from "@/stores/nav-store"
import { PluginManagerModal } from "./plugin-manager-modal"
import { PluginManagerSidebar } from "./plugin-manager-sidebar"
import { MovieSearchSidebar } from "@/plugins/movie-plugin/components/MovieSearchSidebar"
import { RSSSidebar } from "@/plugins/rss-plugin/components/RSSSidebar"

// This is sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    mails: [
        {
            name: "William Smith",
            email: "williamsmith@example.com",
            subject: "Meeting Tomorrow",
            date: "09:34 AM",
            teaser:
                "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        }
        
    ],
}

export function AppSidebar({ onSelectedPluginChange, ...props }: React.ComponentProps<typeof MultiSidebar> & { onSelectedPluginChange?: (plugin: any) => void }) {
    const navMain = useNavMain()
    const { setActiveItem } = useNavStore()
    const [activePlugin, setActivePlugin] = React.useState<any>(null)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false)
    const [selectedPlugin, setSelectedPlugin] = React.useState<any>(null)
    const { toggleSidebar } = useLeftSidebar()

    // 处理插件点击
    const handlePluginClick = (item: any) => {
        if (activePlugin?.id === item.id) {
            // 如果点击的是当前激活的插件，关闭插件内容并切换侧边栏
            setActiveItem(null)
            setActivePlugin(null)
            setSelectedPlugin(null)
            onSelectedPluginChange?.(null)
            toggleSidebar() // 切换显示/隐藏
        } else {
            // 如果点击的是其他插件，激活该插件
            setActivePlugin(item)
            setActiveItem(item)
            setSelectedPlugin(null)
            onSelectedPluginChange?.(null)
        }
    }

    // 处理插件管理中的插件选择
    const handlePluginManagerPluginSelect = (plugin: any) => {
        setSelectedPlugin(plugin)
        onSelectedPluginChange?.(plugin)
    }

    return (
        <MultiSidebar
            side="left"
            collapsible="icon"
            {...props}
        >
            <div className="flex h-full w-full">
                {/* This is the first sidebar - icon sidebar */}
                <div className="w-[calc(var(--sidebar-width-icon)+1px)] border-r bg-sidebar text-sidebar-foreground flex flex-col">
                    <div className="flex flex-col gap-2 p-2">
                        <div className="flex items-center gap-2 p-2">
                            <a href="#" className="flex items-center gap-2">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Acme Inc</span>
                                    <span className="truncate text-xs">Enterprise</span>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                        <div className="relative flex w-full min-w-0 flex-col p-2">
                            <div className="w-full text-sm">
                                <ul className="flex w-full min-w-0 flex-col gap-1">
                                    {navMain.map((item) => (
                                        <li key={item.title} className="group/menu-item relative">
                                            <button
                                                onClick={() => handlePluginClick(item)}
                                                className={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ${activePlugin?.id === item.id ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : ''} px-2.5 md:px-2`}
                                            >
                                                <item.icon className="size-4 shrink-0" />
                                                <span className="truncate">{item.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-2">
                        <NavUser user={data.user} />
                        {/* 插件管理按钮 */}
                        <button
                            onClick={() => {
                                const pluginManagerItem = {
                                    id: 'plugin-manager',
                                    title: '插件管理',
                                    description: '管理已安装的插件',
                                    icon: Settings
                                };
                                handlePluginClick(pluginManagerItem);
                            }}
                            className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 px-2.5 md:px-2 ${activePlugin?.id === 'plugin-manager' ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : ''}`}
                            title="插件管理"
                        >
                            <Settings className="size-4 shrink-0" />
                            <span className="truncate">插件管理</span>
                        </button>
                    </div>
                </div>

                {/* This is the second sidebar - plugin content sidebar */}
                <div className="hidden flex-1 md:flex flex-col bg-sidebar text-sidebar-foreground">
                    {activePlugin ? (
                        <>
                            <div className="flex flex-col gap-2 p-4 border-b">
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <activePlugin.icon className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-foreground text-base font-medium">
                                                {activePlugin.title}
                                            </div>
                                            {activePlugin.description && (
                                                <div className="text-muted-foreground text-sm">
                                                    {activePlugin.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActivePlugin(null)}
                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground"
                                        title="关闭插件"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                                <div className="relative flex w-full min-w-0 flex-col p-4">
                                    <div className="w-full text-sm">
                                        {/* 这里显示插件内容 */}
                                        <div className="plugin-content">
                                            {activePlugin.id === 'movie-data' ? (
                                                // 电影插件显示搜索条件
                                                <MovieSearchSidebar />
                                            ) : activePlugin.id === 'plugin-manager' ? (
                                                // 插件管理界面 - 像电影插件一样显示
                                                <PluginManagerSidebar
                                                    selectedPlugin={selectedPlugin}
                                                    onPluginSelect={handlePluginManagerPluginSelect}
                                                />
                                            ) : activePlugin.id === 'rss-reader' ? (
                                                // RSS 源在第二侧边栏只显示“源列表”（纯列表模式）
                                                <RSSSidebar mode="list-only" />
                                            ) : activePlugin.component ? (
                                                // 渲染插件的component属性
                                                React.createElement(activePlugin.component)
                                            ) : activePlugin.routes && activePlugin.routes.length > 0 ? (
                                                // 渲染插件的实际组件
                                                React.createElement(activePlugin.routes[0].component)
                                            ) : (
                                                // 显示默认的插件信息
                                                <>
                                                    <h3 className="text-lg font-semibold mb-4">{activePlugin.title}</h3>
                                                    <div className="space-y-3">
                                                        <div className="p-3 bg-blue-50 rounded-lg">
                                                            <p className="text-sm text-blue-800">插件功能</p>
                                                            <p className="text-xs text-blue-600">{activePlugin.description}</p>
                                                        </div>
                                                        <div className="p-3 bg-green-50 rounded-lg">
                                                            <p className="text-sm text-green-800">状态</p>
                                                            <p className="text-xs text-green-600">已激活</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                            <div className="relative flex w-full min-w-0 flex-col p-4">
                                <div className="w-full text-sm">
                                    {/* 默认状态：没有激活插件时显示 */}
                                    <div className="plugin-content">
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">选择插件</h3>
                                            <p className="text-muted-foreground text-sm">
                                                点击左侧的插件图标来查看详细信息
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* 插件管理模态框 */}
            <PluginManagerModal 
                open={isSettingsModalOpen}
                onOpenChange={setIsSettingsModalOpen}
            />
            
        </MultiSidebar>
    )
}
