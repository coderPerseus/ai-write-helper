import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { type ComponentPropsWithoutRef } from 'react';
// 通知配置对象,用于显示注入脚本错误的通知
const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: '注入脚本错误',
  message: '您不能在此注入脚本!',
} as const;

const Popup = () => {
  // 使用存储钩子获取主题设置
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const toggleSidePanel = async () => {
    try {
      // 获取当前窗口
      const currentWindow = await chrome.windows.getCurrent();
      if (!currentWindow) {
        throw new Error('当前窗口不存在');
      }
      // 使用 windowId 打开侧边栏
      await chrome.sidePanel.open({
        windowId: currentWindow.id as number,
      });

      // 关闭 popup
      window.close();
    } catch (error) {
      // 显示错误通知
      chrome.notifications.create({
        ...notificationOptions,
        message: '无法打开侧边栏,请确保扩展正常运行',
      });
      console.error('侧边栏操作失败:', error);
    }
  };

  return (
    <div className={`p-4 text-center ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={` ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <div className="text-lg font-bold">码农写作助手,帮你快速生成内容</div>
        <div className="flex justify-center gap-2">
          <ToggleButton>切换主题</ToggleButton>
          <button
            className={
              'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
              (isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white')
            }
            onClick={toggleSidePanel}>
            打开侧边栏
          </button>
        </div>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> 加载中 ... </div>), <div>未知错误</div>);
