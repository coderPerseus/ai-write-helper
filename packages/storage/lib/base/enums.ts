/**
 * Storage area type for persisting and exchanging data.
 * @see https://developer.chrome.com/docs/extensions/reference/storage/#overview
 */
export enum StorageEnum {
  /**
   * Persist data locally against browser restarts. Will be deleted by uninstalling the extension.
   * 默认的存储方式
   * 数据保存在用户的本地浏览器中
   * 在浏览器重启后数据仍然保留
   * 只有卸载扩展时数据才会被删除
   * 适用场景：用户偏好设置、缓存数据等
   * @default
   */
  Local = 'local',
  /**
   * Uploads data to the users account in the cloud and syncs to the users browsers on other devices. Limits apply.
   * 数据会上传到用户的云账户
   * 可以在用户的多个设备间同步
   * 有存储限制
   * 适用场景：需要跨设备同步的用户数据
   */
  Sync = 'sync',
  /**
   * Requires an [enterprise policy](https://www.chromium.org/administrators/configuring-policy-for-extensions) with a
   * json schema for company wide config.
   * 需要企业策略支持
   * 通过 JSON schema 进行公司范围的配置
   * 适用场景：企业级配置管理
   */
  Managed = 'managed',
  /**
   * Only persist data until the browser is closed. Recommended for service workers which can shutdown anytime and
   * therefore need to restore their state. Set {@link SessionAccessLevelEnum} for permitting content scripts access.
   * 数据只在浏览器开启期间保存
   * 关闭浏览器后数据会清除
推荐用于 Service Workers
适用场景：临时数据存储
   * @implements Chromes [Session Storage](https://developer.chrome.com/docs/extensions/reference/storage/#property-session)
   */
  Session = 'session',
}

/**
 * Global access level requirement for the {@link StorageEnum.Session} Storage Area.
 * 会话存储的访问级别
 * @implements Chromes [Session Access Level](https://developer.chrome.com/docs/extensions/reference/storage/#method-StorageArea-setAccessLevel)
 */
export enum SessionAccessLevelEnum {
  /**
   * Storage can only be accessed by Extension pages (not Content scripts).
   * @default 仅扩展页面可访问
   * 默认设置
只有扩展自己的页面可以访问存储
   * 更安全的选项
   * 适用场景：敏感数据存储
   */
  ExtensionPagesOnly = 'TRUSTED_CONTEXTS',
  /**
   * Storage can be accessed by both Extension pages and Content scripts.
   * 扩展页面和内容脚本都可访问
   * 允许内容脚本也能访问存储
   * 提供更大的灵活性
   * 需要注意安全性
   * 适用场景：需要在网页中访问存储数据
   */
  ExtensionPagesAndContentScripts = 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
}
