import { useAccount } from '@/global/contexts/AccountsContext';
import { Spin, Typography } from 'antd';
import { BitBadgesUserInfo, getAbbreviatedAddress, isAddressValid } from 'bitbadgesjs-sdk';

const MINT_ACCOUNT = BitBadgesUserInfo.MintAccount();
const { Text } = Typography;

export function Address({
  addressOrUsername,
  fontSize = 16,
  fontColor,
  hidePortfolioLink
}: {
  addressOrUsername: string;
  fontSize?: number | string;
  fontColor?: string;
  hidePortfolioLink?: boolean;
}) {
  const userInfo = useAccount(addressOrUsername);

  const addressName = userInfo?.username;
  const resolvedName = userInfo?.resolvedName;
  let address = userInfo?.address || addressOrUsername || '';

  const isValidAddress = isAddressValid(address) || address == 'All';
  const displayAddress = addressName ? addressName : resolvedName ? resolvedName : getAbbreviatedAddress(address);

  const innerContent = displayAddress;

  const showLink = !hidePortfolioLink && address && address !== MINT_ACCOUNT.address && address != 'All';
  const invalidAddress = !isValidAddress;

  return (
    <div>
      <div
        style={{
          verticalAlign: 'middle',
          paddingLeft: 5,
          fontSize: fontSize
        }}
        className="whitespace-nowrap">
        <Text
          className={'primary-text ' + (!showLink ? '' : ' link-button-nav')}
          onClick={
            !showLink
              ? undefined
              : () => {
                  window.open(`https://bitbadges.io/account/${address}`);
                }
          }
          copyable={{
            text: address,
            tooltips: ['Copy Address', 'Copied!']
          }}
          style={{
            color: invalidAddress ? 'red' : fontColor,
            display: 'inline-flex'
          }}>
          <b>{userInfo ? <>{innerContent}</> : !invalidAddress ? <Spin /> : <>{displayAddress}</>}</b>
        </Text>
      </div>
    </div>
  );
}
