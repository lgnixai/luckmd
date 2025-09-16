import React from 'react';
import { LuckmdPlugin, RenderSlot } from '@luckmd/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

export interface MultiPaneShellProps {
  plugins: LuckmdPlugin[];
  onActivate?: (plugin: LuckmdPlugin | null) => void;
}

export const MultiPaneShell: React.FC<MultiPaneShellProps> = ({ plugins, onActivate }) => {
  const [active, setActive] = React.useState<LuckmdPlugin | null>(null);
  const [middleSidebarVisible, setMiddleSidebarVisible] = React.useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = React.useState(true);
  const queryClient = React.useMemo(() => new QueryClient(), []);

  const activate = (p: LuckmdPlugin) => {
    setActive(p);
    onActivate?.(p);
  };

  // 首次渲染或插件变化时，自动激活第一个插件，避免首屏空白
  React.useEffect(() => {
    if (!active && plugins.length > 0) {
      activate(plugins[0]);
    }
  }, [plugins]);

  return (
    <QueryClientProvider client={queryClient}>
    <div className="flex h-screen bg-gray-50" data-testid="luckmd-ready">
      {/* 占位提示，便于自动化断言 */}
      <div className="absolute left-2 top-2 text-xs text-gray-500 pointer-events-none select-none">LuckMD Ready</div>
      
      {/* 侧边栏控制按钮 */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={() => setMiddleSidebarVisible(!middleSidebarVisible)}
          className={`p-2 border rounded shadow-sm hover:bg-gray-50 ${middleSidebarVisible ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
          title={middleSidebarVisible ? "隐藏中间侧边栏" : "显示中间侧边栏"}
        >
          {middleSidebarVisible ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        <button
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          className={`p-2 border rounded shadow-sm hover:bg-gray-50 ${rightSidebarVisible ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
          title={rightSidebarVisible ? "隐藏右侧边栏" : "显示右侧边栏"}
        >
          {rightSidebarVisible ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* left: icon list - 固定宽度 */}
      <div className="w-14 border-r bg-sidebar text-sidebar-foreground p-2 space-y-2">
        {plugins.map((p) => (
          <button
            key={p.id}
            onClick={() => activate(p)}
            className={`w-full aspect-square rounded-md flex items-center justify-center hover:bg-sidebar-accent ${active?.id === p.id ? 'bg-sidebar-accent' : ''}`}
            title={p.title}
          >
            {p.icon ? React.createElement(p.icon, { className: 'w-4 h-4' }) : <span className="text-xs">{p.title[0]}</span>}
          </button>
        ))}
      </div>

      {/* 右侧区域使用 PanelGroup 进行可调整布局 */}
      <div className="flex-1 h-full">
        <PanelGroup direction="horizontal" className="h-full">
          {middleSidebarVisible && (
            <>
              <Panel defaultSize={24} minSize={15} className="min-w-0">
                <div className="h-full border-r bg-sidebar text-sidebar-foreground overflow-auto flex flex-col">
                  <div className="flex-1 overflow-auto">
                    {active?.Sidebar ? React.createElement(active.Sidebar) : (
                      <div className="p-4 text-sm text-muted-foreground">选择左侧插件</div>
                    )}
                  </div>
                  <RenderSlot name="sidebar.footer" />
                </div>
              </Panel>
              <PanelResizeHandle className="w-[3px] bg-border hover:bg-border/80 transition-colors" />
            </>
          )}

          <Panel defaultSize={rightSidebarVisible ? 56 : 76} minSize={30} className="min-w-0">
            <div className="h-full overflow-auto">
              {active?.Content ? React.createElement(active.Content) : (
                <div className="p-4 text-muted-foreground">内容区</div>
              )}
            </div>
          </Panel>

          {rightSidebarVisible && (
            <>
              <PanelResizeHandle className="w-[3px] bg-border hover:bg-border/80 transition-colors" />
              <Panel defaultSize={20} minSize={15} className="min-w-0">
                <div className="h-full border-l bg-sidebar text-sidebar-foreground overflow-auto flex flex-col">
                  <div className="p-3 border-b">
                    <h3 className="text-sm font-medium">右侧面板</h3>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p>这里可以放置：</p>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• 属性面板</li>
                          <li>• 文件树</li>
                          <li>• 搜索结果</li>
                          <li>• 调试信息</li>
                          <li>• 其他工具</li>
                        </ul>
                      </div>
                      <RenderSlot name="right-sidebar.content" />
                    </div>
                  </div>
                  <RenderSlot name="right-sidebar.footer" />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
    </QueryClientProvider>
  );
};


