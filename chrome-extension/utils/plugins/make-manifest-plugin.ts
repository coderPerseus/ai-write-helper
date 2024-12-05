import { colorLog, ManifestParser } from '@extension/dev-utils';
import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import type { PluginOption } from 'vite';
// 设置根目录和 manifest 文件路径
const rootDir = resolve(__dirname, '..', '..');
const manifestFile = resolve(rootDir, 'manifest.js');
// 获取 Manifest 配置
const getManifestWithCacheBurst = (): Promise<{ default: chrome.runtime.ManifestV3 }> => {
  const withCacheBurst = (path: string) => `${path}?${Date.now().toString()}`;
  /**
   * In Windows, import() doesn't work without file:// protocol.
   * So, we need to convert path to file:// protocol. (url.pathToFileURL)
   */
  if (process.platform === 'win32') {
    return import(withCacheBurst(pathToFileURL(manifestFile).href));
  }

  return import(withCacheBurst(manifestFile));
};

export default function makeManifestPlugin(config: { outDir: string }): PluginOption {
  // 生成 Manifest 文件
  function makeManifest(manifest: chrome.runtime.ManifestV3, to: string) {
    // 如果目标目录不存在，则创建目录
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const manifestPath = resolve(to, 'manifest.json');
    // 判断是否为 Firefox 浏览器
    const isFirefox = process.env.__FIREFOX__ === 'true';
    // 将 Manifest 转换为字符串并写入文件
    fs.writeFileSync(manifestPath, ManifestParser.convertManifestToString(manifest, isFirefox ? 'firefox' : 'chrome'));
    // 打印成功信息
    colorLog(`Manifest file copy complete: ${manifestPath}`, 'success');
  }
  // 返回 Vite 插件配置
  return {
    name: 'make-manifest',
    // 监听 manifest 文件变化
    buildStart() {
      this.addWatchFile(manifestFile);
    },
    // 生成 Manifest 文件
    async writeBundle() {
      const outDir = config.outDir;
      const manifest = await getManifestWithCacheBurst();
      makeManifest(manifest.default, outDir);
    },
  };
}
