import { ReactNode } from 'react';

export const AltTabs = ({
  tabs,
  tab,
  setTab,
  centered
}: {
  tabs: (
    | undefined
    | {
        label: string | ReactNode;
        key: string;
      }
  )[];
  tab: string;
  setTab: (tab: string) => void;
  centered?: boolean;
}) => {
  return (
    <div className="flex-center w-full text-center mt-2">
      <ul
        style={{ overflow: 'auto', float: 'left' }}
        className={`list-none flex text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 ${centered ? '' : ''} `}>
        {tabs.map((x, i) => {
          if (!x) return null;
          return (
            <div className={i === tabs.length - 1 ? 'flex ' : ' flex me-2'} key={x.key}>
              <a
                onClick={() => setTab(x.key)}
                aria-current="page"
                className={
                  tab === x.key
                    ? 'flex font-bold capitalize p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
                    : 'flex font-bold capitalize p-4 text-gray-400 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }>
                {x.label}
              </a>
            </div>
          );
        })}
      </ul>
    </div>
  );
};
