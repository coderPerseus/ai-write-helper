# 项目基础
一个基于 https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite 模板的chrome插件项目
## 技术栈

React 18
TypeScript
Vite (构建工具)
TailwindCSS (样式框架)
Turborepo (monorepo 管理工具)

## 主要功能

支持 Chrome Extensions Manifest V3 (最新版扩展标准)
支持热更新(HMR)开发
内置国际化(i18n)支持
完整的 TypeScript 类型支持
包含 ESLint 和 Prettier 代码规范配置
自定义 HMR（热模块重建）插件
使用 WebdriverIO 进行端到端测试


## 项目结构

主要包含以下几个部分:
pages/: 扩展的各个页面
popup (点击扩展图标显示的弹窗)
options (扩展的设置页面)
content (注入到网页中的脚本)
devtools (开发者工具面板)
new-tab (新标签页)
side-panel (侧边栏)
packages/: 共享的功能模块
ui (UI组件)
storage (存储相关)
i18n (国际化)
shared (共享代码)

## 开发流程

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build
```

## 项目启动后

1. 首先运行开发命令: `pnpm dev`
2. 打开 Chrome 浏览器,进入扩展管理页面:
   在地址栏输入: chrome://extensions/
   或者点击浏览器右上角的"扩展"图标,选择"管理扩展程序"
3. 在扩展管理页面: 
- 打开右上角的"开发者模式"开关
- 点击左上角的"加载已解压的扩展程序"按钮
- 选择项目中的 dist 目录
4. 安装成功后,您可以在以下位置看到扩展的不同部分:
- 弹出窗口(Popup)
- 点击浏览器工具栏中的扩展图标
5. 新标签页(New Tab)
- 打开新的标签页即可看到
6. 内容脚本(Content Script)
- 访问任意网页,在页面底部可以看到注入的 UI
7. 开发者工具面板(DevTools)
- 打开浏览器开发者工具(F12)
- 在顶部标签中可以看到新增的面板
8. 侧边栏(Side Panel)
- 点击浏览器工具栏的扩展图标
- 选择"在侧边栏中打开"
9. 选项页面(Options)
- 在扩展图标上右键
- 选择"选项"

开发提示:
代码修改后会自动重新构建
大多数情况下会自动重新加载扩展
如果没有自动重新加载,可以在扩展管理页面手动点击"重新加载"
建议打开 Chrome 的开发者工具查看控制台输出


## 知识点

1）chrome.tabs.create ：在当前窗口中创建一个新标签页，并导航到指定的 URL

2）chrome.scripting.executeScript ：在当前页面中注入脚本 ，
```js
chrome.scripting.executeScript({
  target: { tabId: tab.id! },
  files: ['/content-runtime/index.iife.js'],
})
```
- target ：指定注入目标，tabId 表示指定标签页，如果不指定，则默认注入到当前标签页
- files ：指定注入的脚本文件，相对于 manifest.json 中的 js 字段

3）chrome.tabs.query ：获取当前页面信息，{ currentWindow: true, active: true } 表示当前窗口和当前活动标签页，返回一个包含当前标签页信息的数组

# 码农写作助手开发

package.json 修改


pages/popup 改造


```typescript
const currentWindow = await chrome.windows.getCurrent()：获取当前窗口
chrome.sidePanel.open({windowId: currentWindow.id})：打开侧边栏
```

packages/i18n 改造

改为自己的语言包

pages/side-panel 改造




