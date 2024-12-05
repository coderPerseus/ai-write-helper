// 用于管理 Chrome 扩展存储的核心实现：
import type { BaseStorage, StorageConfig, ValueOrUpdate } from './types';
import { SessionAccessLevelEnum, StorageEnum } from './enums';

/**
 * Chrome reference error while running `processTailwindFeatures` in tailwindcss.
 *  To avoid this, we need to check if the globalThis.chrome is available and add fallback logic.
 */
const chrome = globalThis.chrome;

/**
 * Sets or updates an arbitrary cache with a new value or the result of an update function.
 * 更新缓存函数
 */
async function updateCache<D>(valueOrUpdate: ValueOrUpdate<D>, cache: D | null): Promise<D> {
  // Type guard to check if our value or update is a function，类型保护，检查valueOrUpdate是否为函数
  function isFunction<D>(value: ValueOrUpdate<D>): value is (prev: D) => D | Promise<D> {
    return typeof value === 'function';
  }

  // Type guard to check in case of a function, if its a Promise，类型保护，检查func是否为Promise
  function returnsPromise<D>(func: (prev: D) => D | Promise<D>): func is (prev: D) => Promise<D> {
    // Use ReturnType to infer the return type of the function and check if it's a Promise
    return (func as (prev: D) => Promise<D>) instanceof Promise;
  }
  // 如果valueOrUpdate是函数
  if (isFunction(valueOrUpdate)) {
    // Check if the function returns a Promise
    // 如果valueOrUpdate返回的是Promise
    if (returnsPromise(valueOrUpdate)) {
      return valueOrUpdate(cache as D);
    } else {
      return valueOrUpdate(cache as D);
    }
  } else {
    // 如果valueOrUpdate不是函数
    return valueOrUpdate;
  }
}

/**
 * If one session storage needs access from content scripts, we need to enable it globally.
 * @default false
 */
let globalSessionAccessLevelFlag: StorageConfig['sessionAccessForContentScripts'] = false;

/**
 * Checks if the storage permission is granted in the manifest.json.
 */
function checkStoragePermission(storageEnum: StorageEnum): void {
  if (!chrome) {
    return;
  }

  if (chrome.storage[storageEnum] === undefined) {
    throw new Error(`Check your storage permission in manifest.json: ${storageEnum} is not defined`);
  }
}

/**
 * Creates a storage area for persisting and exchanging data.
 * 这是一个工厂函数，用于创建存储实例，支持以下特性
 * 类型安全的存储管理
 * 缓存机制
 * 发布订阅模式
 * 序列化/反序列化
 * 实时更新
 */
export function createStorage<D = string>(key: string, fallback: D, config?: StorageConfig<D>): BaseStorage<D> {
  let cache: D | null = null; // 内存缓存
  let initedCache = false; // 缓存初始化标志
  let listeners: Array<() => void> = []; // 监听器数组
  // 配置处理
  const storageEnum = config?.storageEnum ?? StorageEnum.Local; // 存储类型(默认local)
  const liveUpdate = config?.liveUpdate ?? false; // 是否实时更新(默认false)

  const serialize = config?.serialization?.serialize ?? ((v: D) => v);
  const deserialize = config?.serialization?.deserialize ?? (v => v as D);

  // Set global session storage access level for StoryType.Session, only when not already done but needed.
  // 设置全局会话存储访问级别，仅在未完成但需要时
  if (
    globalSessionAccessLevelFlag === false &&
    storageEnum === StorageEnum.Session &&
    config?.sessionAccessForContentScripts === true
  ) {
    checkStoragePermission(storageEnum);
    chrome?.storage[storageEnum]
      .setAccessLevel({
        accessLevel: SessionAccessLevelEnum.ExtensionPagesAndContentScripts,
      })
      .catch(error => {
        console.warn(error);
        console.warn('Please call setAccessLevel into different context, like a background script.');
      });
    globalSessionAccessLevelFlag = true;
  }

  // Register life cycle methods 获取数据
  const get = async (): Promise<D> => {
    // 权限校验
    checkStoragePermission(storageEnum);
    // 获取数据
    const value = await chrome?.storage[storageEnum].get([key]);

    if (!value) {
      return fallback;
    }

    return deserialize(value[key]) ?? fallback;
  };

  // 触发数据更新
  const _emitChange = () => {
    listeners.forEach(listener => listener());
  };

  // 设置数据
  const set = async (valueOrUpdate: ValueOrUpdate<D>) => {
    if (initedCache === false) {
      cache = await get();
    }
    cache = await updateCache(valueOrUpdate, cache);

    await chrome?.storage[storageEnum].set({ [key]: serialize(cache) });
    _emitChange();
  };

  // 订阅变更
  const subscribe = (listener: () => void) => {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  const getSnapshot = () => {
    return cache;
  };

  get().then(data => {
    cache = data;
    initedCache = true;
    _emitChange();
  });

  // Listener for live updates from the browser 存储变更监听
  async function _updateFromStorageOnChanged(changes: { [key: string]: chrome.storage.StorageChange }) {
    // Check if the key we are listening for is in the changes object
    if (changes[key] === undefined) return;

    const valueOrUpdate: ValueOrUpdate<D> = deserialize(changes[key].newValue);

    if (cache === valueOrUpdate) return;

    cache = await updateCache(valueOrUpdate, cache);

    _emitChange();
  }

  // Register listener for live updates for our storage area
  if (liveUpdate) {
    chrome?.storage[storageEnum].onChanged.addListener(_updateFromStorageOnChanged);
  }

  return {
    get,
    set,
    getSnapshot,
    subscribe,
  };
}
