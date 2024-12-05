import { exampleThemeStorage } from '@extension/storage';
import 'webextension-polyfill';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
// 可以在这里处理:
// - 全局状态管理
// - 事件监听
// - API 调用
// - 跨页面通信

// 监听来自popup的消息
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === 'open-sidebar') {
//     // 打开侧边栏
//     chrome.sidePanel.open().catch(error => {
//       console.error('打开侧边栏失败:', error);
//     });

//     // 必须返回true以支持异步响应
//     return true;
//   }
// });
