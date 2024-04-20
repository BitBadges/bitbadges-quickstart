import { Menu, MenuTheme } from 'antd';

export function Tabs({
  hideOnSingleTab,
  type,
  style,
  tab,
  setTab,
  tabInfo,
  fullWidth,
  theme,
  noSelectedKeys,
  customClass
}: {
  tab: string;
  setTab: (tab: string) => void;
  tabInfo: ({ key: string; content: string | JSX.Element; disabled?: boolean; onClick?: () => void } | undefined)[];
  fullWidth?: boolean;
  theme?: MenuTheme;
  noSelectedKeys?: boolean;
  type?: 'underline' | 'default';
  customClass?: string;
  style?: React.CSSProperties;
  hideOnSingleTab?: boolean;
}) {
  let tabInfoFiltered = tabInfo.filter((tab) => tab != undefined) as {
    key: string;
    content: string | JSX.Element;
    disabled?: boolean;
    onClick?: () => void;
    subMenuOverlay?: JSX.Element;
    subMenuTrigger?: ('contextMenu' | 'click' | 'hover')[];
    popoverContent?: JSX.Element;
  }[];

  if (hideOnSingleTab && tabInfoFiltered.length == 1) {
    return <></>;
  }

  const widthPerTab = fullWidth ? `calc(100% / ${tabInfoFiltered.length})` : undefined;
  const selectedTab = tab;

  const tabs = tabInfoFiltered.map((tab, idx) => {
    const menuItem = (
      <Menu.Item
        disabled={tab.disabled}
        style={{
          marginLeft: idx == 0 ? 0 : 1,
          marginRight: idx == tabInfoFiltered.length - 1 ? 0 : 1,
          width: widthPerTab,
          minWidth: 'fit-content',
          textAlign: 'center',
          float: 'left',
          backgroundColor: type == 'underline' ? 'inherit' : undefined,
          color: tab.key == selectedTab && type != 'underline' ? 'white' : undefined,
          borderBottom: type == 'underline' && selectedTab == tab.key ? '2px solid lightblue' : undefined
        }}
        key={`${tab.key}`}
        onClick={
          tab.onClick
            ? tab.onClick
            : () => {
                setTab(tab.key);
              }
        }
        id={tab.key}
        className={
          'primary-text   inherit-bg border-vivid-blue ' +
          (customClass ? ' ' + customClass : '') +
          (type !== 'underline' ? ' rounded-lg' : '')
        }
      >
        <div
          className={'primary-text ' + (type == 'underline' ? ' hover:text-gray-400' : '')}
          style={{
            color: tab.key == selectedTab && type != 'underline' ? 'white' : undefined,
            fontSize: 18,
            fontWeight: 'bolder'
          }}
        >
          {tab.content}
        </div>
      </Menu.Item>
    );
    return menuItem;
  });

  return (
    <Menu
      style={{ display: 'flex', overflow: 'auto', ...style }}
      theme={theme ? theme : 'dark'}
      mode="horizontal"
      selectedKeys={noSelectedKeys ? [] : [tab]}
      disabledOverflow
    >
      {tabs}
    </Menu>
  );
}
