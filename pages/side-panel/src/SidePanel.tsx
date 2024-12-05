import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import '@src/SidePanel.css';
import type { ComponentPropsWithoutRef } from 'react';

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const icon = isLight ? 'side-panel/dark.svg' : 'side-panel/light.svg';
  return (
    <div className={`h-screen w-screen ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header
        className={`flex items-center justify-between px-3 py-2 shadow-md   ${isLight ? 'text-gray-900 shadow-slate-200' : 'text-gray-100 shadow-slate-700'}`}>
        <span>正在开发中。。。</span>
        <ToggleButton>
          <img src={chrome.runtime.getURL(icon)} className="size-6" alt="logo" />
        </ToggleButton>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  return (
    <button
      className={props.className + ' ' + 'font-bold  py-1 px-4 rounded shadow hover:scale-105 '}
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
