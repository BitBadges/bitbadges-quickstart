import { BitBadgesApi } from '@/global/api';
import { useAccount, useAccountsContext } from '@/global/contexts/AccountsContext';
import { useCollectionsContext } from '@/global/contexts/CollectionsContext';
import { Avatar, Tooltip } from 'antd';
import { BatchBadgeDetailsArray, SupportedChain } from 'bitbadgesjs-sdk';
import { useEffect, useState } from 'react';
import { AddressDisplay } from './address/AddressDisplay';
import { AddressSelect } from './address/AddressSelect';
import { DisplayCard } from './display/DisplayCard';
import { BadgeMetadataDisplay } from './display/MetadataDisplay';
import { StyledButton } from './display/StyledButton';
import { ProtocolsDisplay } from './ProtocolsDisplay';

export const UserQueryInfo = () => {
  const { setAccounts } = useAccountsContext();
  const { setCollections } = useCollectionsContext();
  const [selectedAddress, setSelectedAddress] = useState('4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP');

  const selectedAccount = useAccount(selectedAddress);

  useEffect(() => {
    BitBadgesApi.getAccounts({
      accountsToFetch: [
        {
          address: '4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP',
          viewsToFetch: [
            {
              viewId: 'badgesCollected',
              viewType: 'badgesCollected',
              bookmark: ''
            }
          ]
        }
      ]
    }).then((res) => {
      setAccounts(res.accounts);
    });
  }, []);

  const [badgesToDisplay, setBadgesToDisplay] = useState<BatchBadgeDetailsArray<bigint>>(new BatchBadgeDetailsArray());
  useEffect(() => {
    const allBadgesToDisplay = BatchBadgeDetailsArray.From<bigint>(
      selectedAccount?.collected
        .map((x) => {
          return { collectionId: x.collectionId, badgeIds: x.balances.map((balance) => balance.badgeIds).flat() };
        })
        .flat() ?? []
    );

    const badgesToDisplay = allBadgesToDisplay.getPage(1, 10);
    BitBadgesApi.getCollections({
      collectionsToFetch: badgesToDisplay?.map((x) => {
        return { collectionId: x.collectionId, badgeIds: x.badgeIds };
      })
    }).then((res) => {
      setCollections(res.collections);
    });

    setBadgesToDisplay(badgesToDisplay);
  }, [selectedAccount]);

  return (
    <>
      <AddressSelect onSelect={(address) => setSelectedAddress(address)} />
      <br />
      <div className="flex-center">
        <AddressDisplay addressOrUsername={selectedAddress} />
      </div>
      <br />
      <div className="flex-center">
        <ButtonDisplay addressOrUsername={selectedAddress} />
      </div>
      <br />
      {selectedAddress && (
        <>
          <div className="flex-center flex-wrap " style={{ alignItems: 'normal' }}>
            <DisplayCard noBorder inheritBg md={12} xs={24} sm={24} title="Badges" subtitle="">
              <>
                <div className="flex-center flex-wrap mt-4">
                  {badgesToDisplay
                    .map((x) => {
                      return (
                        <div key={x.collectionId.toString()} className="flex-center flex-wrap">
                          {x.badgeIds
                            .map((badgeId) => {
                              for (let i = badgeId.start; i <= badgeId.end; i++) {
                                return (
                                  <BadgeMetadataDisplay key={i.toString()} collectionId={x.collectionId} badgeId={i} />
                                );
                              }
                            })
                            .flat()}
                        </div>
                      );
                    })
                    .flat()}
                </div>
                {badgesToDisplay.length === 0 && <div className="secondary-text text-center">No badges found</div>}
              </>
            </DisplayCard>
            <DisplayCard noBorder inheritBg md={12} xs={24} sm={24} title="Protocols" subtitle="">
              <ProtocolsDisplay addressOrUsername={selectedAddress} />
            </DisplayCard>
          </div>
          <div className="mt-10 flex-center">
            <StyledButton
              onClick={() => {
                window.open('https://bitbadges.io/account/' + selectedAddress, '_blank');
              }}>
              View All on BitBadges
            </StyledButton>
          </div>
        </>
      )}
    </>
  );
};

export function ButtonDisplay({
  addressOrUsername,

  mobile
}: {
  addressOrUsername: string;
  mobile?: boolean;
}) {
  const _accountInfo = useAccount(addressOrUsername);
  const accountInfo = _accountInfo;

  const address = accountInfo?.address;

  const openSeaLink = 'https://opensea.io/' + address;
  const etherscanLink = 'https://etherscan.io/address/' + address;
  const stargazeLink = `https://www.stargaze.zone/p/${address?.replace('cosmos', 'stars')}/tokens`;

  return (
    <>
      {
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'end', maxWidth: 400 }}>
          {accountInfo?.chain === SupportedChain.ETH && (
            <a href={openSeaLink} target="_blank" rel="noreferrer">
              <Tooltip title="OpenSea" placement="bottom">
                <Avatar
                  size={mobile ? 'large' : 'large'}
                  onClick={() => {}}
                  className="styled-button-normal account-socials-button"
                  src={'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png'}></Avatar>
              </Tooltip>
            </a>
          )}
          {accountInfo?.chain === SupportedChain.COSMOS && (
            <a href={stargazeLink} target="_blank" rel="noreferrer">
              <Tooltip title="Stargaze" placement="bottom">
                <Avatar
                  size={mobile ? 'large' : 'large'}
                  onClick={() => {}}
                  className="styled-button-normal account-socials-button"
                  src={'https://pbs.twimg.com/profile_images/1507391623914737669/U3fR7nxh_400x400.jpg'}></Avatar>
              </Tooltip>
            </a>
          )}
          {accountInfo?.chain === SupportedChain.ETH && (
            <a href={etherscanLink} target="_blank" rel="noreferrer">
              <Tooltip title="Etherscan" placement="bottom">
                <Avatar
                  size={mobile ? 'large' : 'large'}
                  onClick={() => {}}
                  style={{ backgroundColor: 'white' }}
                  className="styled-button-normal account-socials-button"
                  src={'https://etherscan.io/images/brandassets/etherscan-logo-circle.svg'}></Avatar>
              </Tooltip>
            </a>
          )}
        </div>
      }
    </>
  );
}
