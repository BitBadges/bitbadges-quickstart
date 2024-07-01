import { Switch } from 'antd';
import DarkModeSwitcher from './display/DarkModeSwitcher';
import { LinkGroup } from './display/LinkGroup';

const Header = ({ devMode, setDevMode }: { devMode: boolean; setDevMode: (val: boolean) => void }) => {
  return (
    <>
      <header className="primary-text">
        <h1 className="banner primary-text">BitBadges Development Quickstart</h1>
        <br />
        <div className="secondary-text text-center px-10">
          Please read the README before you edit this template. This quickstarter helps you get started with common
          BitBadges development flows. It is a starting point and can be customized to fit your needs (see docs).
        </div>
        <br />
        <div className="flex-center">
          <div className="m-2">{'Dark Mode'}</div>
          <DarkModeSwitcher />

          <div className="m-2">{'Dev Mode'}</div>
          <div className="flex-center flex items-center justify-center text-xs font-medium text-yellow-500">
            <Switch checked={devMode} onChange={() => setDevMode(!devMode)} className="dark-mode-switcher" />
          </div>
        </div>
        <LinkGroup
          links={[
            { title: 'Developer Portal', href: 'https://bitbadges.io/developer' },
            { title: 'Documentation', href: 'https://docs.bitbadges.io' },
            { title: 'Github', href: 'https://github.com/bitbadges' },
            { title: 'Explorer', href: 'https://explorer.bitbadges.io' },
            { title: 'Discord Support', href: 'https://discord.com/invite/TJMaEd9bar' }
          ]}
        />
      </header>
      <br />
    </>
  );
};

export default Header;
