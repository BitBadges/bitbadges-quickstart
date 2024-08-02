import { useAccount } from '@/global/contexts/AccountsContext';
import { Avatar, Tooltip } from 'antd';
import { SupportedChain, getChainForAddress } from 'bitbadgesjs-sdk';
import { getChainLogo } from '../../../constants';
import { Address } from './Address';
import { BlockiesAvatar } from './Blockies';

export function AddressWithBlockies({
  addressOrUsername,
  fontSize = 16,
  fontColor,
  hidePortfolioLink
}: {
  addressOrUsername: string;
  fontSize?: number;
  fontColor?: string;
  hidePortfolioLink?: boolean;
}) {
  const fetchedAccount = useAccount(addressOrUsername);
  const userInfo = fetchedAccount;
  const address = userInfo?.address || addressOrUsername || '';
  const chainLogo = getChainLogo(getChainForAddress(address));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {address !== 'Mint' && address !== 'All' && (
        <Tooltip
          title={
            getChainForAddress(address) !== SupportedChain.UNKNOWN
              ? `This address is for a ${getChainForAddress(address)} user`
              : `Unknown`
          }
          placement="bottom">
          <Avatar src={chainLogo} style={{ marginRight: 8 }} size={fontSize} />
        </Tooltip>
      )}
      <BlockiesAvatar
        shape="square"
        address={address}
        avatar={userInfo?.profilePicUrl ?? userInfo?.avatar}
        fontSize={fontSize}
      />
      <Address
        fontSize={fontSize}
        addressOrUsername={addressOrUsername}
        fontColor={fontColor}
        hidePortfolioLink={hidePortfolioLink}
      />
    </div>
  );
}
