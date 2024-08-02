import { ReactNode, useState } from 'react';
import { DisplayCard } from './DisplayCard';

const Tab = ({ label, onClick, active } = { label: '', onClick: () => {}, active: '' }) => {
  return (
    <li>
      <a
        onClick={onClick}
        className={`${
          active
            ? 'active inline-flex items-center px-4 py-3 text-white bg-blue-700 rounded-lg  w-full dark:bg-blue-600'
            : 'inline-flex items-center px-4 py-3 text-gray-400 rounded-lg cursor-pointer bg-gray-300 primary-text w-full  dark:bg-gray-800 dark:text-gray-500'
        }`}
        aria-current="page">
        {label}
      </a>
    </li>
  );
};

export const TabDisplay = ({
  tabs
}: {
  tabs: { label: string; description: string; node: ReactNode; noTitle?: boolean }[];
}) => {
  const [currTab, setCurrTab] = useState(tabs?.[0].label ?? '');

  const navTabs = tabs;
  return (
    <div>
      <div className="px-8">
        <div className="md:flex">
          <ul className="flex-column space-y space-y-4 text-sm font-medium md:me-4 mb-4 md:mb-0">
            {navTabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                onClick={() => {
                  setCurrTab(tab.label);
                }}
                active={currTab === tab.label ? 'active' : ''}
              />
            ))}
          </ul>
          <div className="text-medium text-gray-500 dark:text-gray-400 w-full " style={{ minHeight: 600 }}>
            <DisplayCard
              noPadding
              title={navTabs.find((tab) => tab.label === currTab)?.noTitle ? '' : currTab}
              subtitle={navTabs.find((tab) => tab.label === currTab)?.description}
              md={24}
              xs={24}
              sm={24}>
              <br />
              {navTabs.find((tab) => tab.label === currTab)?.node}
            </DisplayCard>
          </div>
        </div>
      </div>
    </div>
  );
};
