import { Switch } from 'antd';
import Image from 'next/image';
import { BITCOIN_LOGO, COSMOS_LOGO, ETH_LOGO, SOLANA_LOGO } from '../../constants';
import DarkModeSwitcher from './display/DarkModeSwitcher';
import { LinkGroup } from './display/LinkGroup';
import { useDevModeContext } from '@/global/contexts/DevModeContext';
import { useWalletModeContext } from '@/global/contexts/WalletModeContext';

const Header = () => {
  const { devMode, setDevMode } = useDevModeContext();
  const { walletMode, setWalletMode } = useWalletModeContext();

  return (
    <>
      <header className="primary-text">
        <h1 className="banner primary-text text-center py-2 pt-10"> Multi-Chain App Quickstarter</h1>
        <div className="mb-4 flex-center flex-wrap">
          <Image
            className="mx-2"
            src={BITCOIN_LOGO}
            alt="Bitcoin Logo"
            width={50}
            height={50}
            style={{ borderRadius: '100%' }}
          />
          <Image
            className="mx-2"
            src={COSMOS_LOGO}
            alt="Cosmos Logo"
            width={50}
            height={50}
            style={{ borderRadius: '100%' }}
          />
          <Image
            className="mx-2"
            src={SOLANA_LOGO}
            alt="Bitcoin Logo"
            width={50}
            height={50}
            style={{ borderRadius: '100%' }}
          />
          <Image
            className="mx-2"
            src={ETH_LOGO}
            alt="Bitcoin Logo"
            width={50}
            height={50}
            style={{ borderRadius: '100%' }}
          />
        </div>
        <div className="text-xs text-center secondary-text font-bold my-2 mb-7 flex-center ">
          Powered by{' '}
          <img src="/images/bitbadgeslogotext.png" className="ml-1" alt="BitBadges Logo" width={75} height={75} />
        </div>
        <div className="flex-center">
          <div className="secondary-text text-center mx-4  mb-4" style={{ maxWidth: '800px' }}>
            This quickstarter helps you get started with common multi-chain development flows. All multi-chain
            functionality is abstracted to ONE interface, making it easier for you to develop with. It is a starting
            point and should be customized to fit your needs. Please read the README and see docs for more information.
          </div>
        </div>
        <div className="flex-center flex-wrap">
          <div className="flex">
            <div className="m-2">{'Dark Mode'}</div>
            <DarkModeSwitcher />
          </div>
          <div className="flex">
            <div className="m-2">{'Dev Mode'}</div>
            <div className="flex-center flex items-center justify-center text-xs font-medium text-yellow-500">
              <Switch checked={devMode} onChange={() => setDevMode(!devMode)} className="dark-mode-switcher" />
            </div>
          </div>
          <div className="flex">
            <div className="m-2">{'In-Site Wallets'}</div>
            <div className="flex-center flex items-center justify-center text-xs font-medium text-yellow-500">
              <Switch checked={walletMode} onChange={() => setWalletMode(!walletMode)} className="dark-mode-switcher" />
            </div>
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
