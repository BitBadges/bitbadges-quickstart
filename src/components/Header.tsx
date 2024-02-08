import DarkModeSwitcher from './display/DarkModeSwitcher';
import { LinkGroup } from './display/LinkGroup';

const Header = () => {

  return (
    <>
      <header className='primary-text'>
        <h1 className='banner primary-text'>
          BitBadges Dev Quickstart
        </h1>
        <br />
        <div className='secondary-text text-center px-10'>
          See the README for more information on how to use this template.
        </div>
        <br />
        <div className='flex-center'>
          <div className='m-2'>{'Dark Mode'}</div>
          <DarkModeSwitcher />
        </div>
        <LinkGroup
          links={[
            { title: 'Documentation', href: 'https://docs.bitbadges.io' },
            { title: 'Github', href: 'https://github.com/bitbadges' },
            { title: 'Explorer', href: 'https://explorer.bitbadges.io' },
            { title: 'Discord Support', href: 'https://discord.com/invite/TJMaEd9bar' },
          ]}
        />
      </header >
      <br />
    </>
  )
}

export default Header;