import React from 'react';
import { useActivePlugin } from '../contexts/plugin-context';
import { PluginContentProps } from '../types/plugin';

interface PluginSidebarProps {
  className?: string;
}

/**
 * 插件侧边栏组件
 * 显示当前激活插件的内容
 */
export const PluginSidebar: React.FC<PluginSidebarProps> = ({ className = '' }) => {
  const { activePlugin, setActivePlugin } = useActivePlugin();

  /**
   * 关闭插件内容
   */
  const handleClose = () => {
    setActivePlugin(null);
  };

  if (!activePlugin) {
    return null;
  }

  const PluginContent = activePlugin.content;
  const pluginProps: PluginContentProps = {
    plugin: activePlugin,
    active: true,
    onClose: handleClose
  };

  return (
    <div className={`plugin-sidebar ${className}`}>
      <div className="plugin-sidebar-header">
        <div className="plugin-sidebar-title">
          <div className="plugin-sidebar-icon">
            {React.createElement(activePlugin.icon)}
          </div>
          <div className="plugin-sidebar-info">
            <h3 className="plugin-sidebar-name">
              {activePlugin.name}
            </h3>
            {activePlugin.description && (
              <p className="plugin-sidebar-description">
                {activePlugin.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="plugin-sidebar-close"
          aria-label="关闭插件"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="plugin-sidebar-content">
        <PluginContent {...pluginProps} />
      </div>
    </div>
  );
};

/**
 * 插件内容容器组件
 */
interface PluginContentContainerProps {
  plugin: any;
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const PluginContentContainer: React.FC<PluginContentContainerProps> = ({
  plugin,
  active,
  onClose,
  children
}) => {
  return (
    <div className={`plugin-content-container ${active ? 'active' : ''}`}>
      <div className="plugin-content-header">
        <h4 className="plugin-content-title">
          {plugin.name}
        </h4>
        <button
          onClick={onClose}
          className="plugin-content-close"
          aria-label="关闭"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="plugin-content-body">
        {children}
      </div>
    </div>
  );
};
