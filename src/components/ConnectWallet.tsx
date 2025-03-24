import { claimIdToUse } from '@/bitbadges-api';
import { StyledButton } from '@/components/display/StyledButton';
import { getPrivateInfo, signOut } from '@/global/backend_connectors';
import { useChainContext } from '@/global/contexts/ChainContext';
import { useWalletModeContext } from '@/global/contexts/WalletModeContext';
import { Avatar, notification } from 'antd';
import { CodeGenQueryParams, SupportedChain, generateBitBadgesAuthUrl } from 'bitbadgesjs-sdk';
import getConfig from 'next/config';
import { useEffect, useState } from 'react';
import { BITCOIN_LOGO, ETH_LOGO, SOLANA_LOGO } from '../../constants';
import { AddressDisplay } from './address/AddressDisplay';
import { AltTabs } from './display/AltTabs';

export const GatedInfoButton = () => {
  const chain = useChainContext();
  return (
    <StyledButton
      className=" text-xs"
      disabled={!chain.loggedIn}
      onClick={async () => {
        try {
          const res = await getPrivateInfo();
          alert(res.message);
        } catch (e) {
          alert('Error fetching private user info: not authenticated');
        }
      }}>
      Get Private User Info
    </StyledButton>
  );
};

export const ConnectDisplay = ({ hideLogo }: { hideLogo?: boolean }) => {
  const { address, setChain, connected } = useChainContext();

  const chainContext = useChainContext();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768);
    });
  }, []);

  const signedIn = chainContext.loggedIn;
  const clientId = getConfig().publicRuntimeConfig.CLIENT_ID;
  const redirectUri = getConfig().publicRuntimeConfig.REDIRECT_URI;

  //TODO: Customize your popup parameters. See the SIWBB documentation for more details (https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/authentication-url-+-parameters)
  const popupParams: CodeGenQueryParams = {
    client_id: clientId || 'example-client-id',
    redirect_uri: redirectUri, //Leave undefined if not applicable and using QR codes

    //You can also specify a claim ID. This is an all-inclusive concept that can check any criteria you want.
    claimId: claimIdToUse
  };

  const { walletMode } = useWalletModeContext();

  return (
    <>
      <div className="mt-2 mx-1">
        <div className="flex-center w-full">
          <div className="secondary-text w-full text-center">
            <div id="default-tab-content w-full">
              <div className="rounded-lg w-full" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                {!chainContext.connected && walletMode && (
                  <>
                    <div className="flex-center w-full mt-2">
                      <AltTabs
                        tabs={[
                          {
                            label: (
                              <>
                                <Avatar src={ETH_LOGO} alt="Ethereum" size={20} className="mr-2" />
                                Ethereum
                              </>
                            ),
                            key: SupportedChain.ETH
                          },
                          {
                            label: (
                              <>
                                <Avatar src={'/images/cosmos-logo.png'} alt="Cosmos" size={20} className="mr-2" />
                                Cosmos
                              </>
                            ),
                            key: SupportedChain.COSMOS
                          },
                          {
                            label: (
                              <>
                                <Avatar src={SOLANA_LOGO} alt="Solana" size={20} className="mr-2" />
                                Solana
                              </>
                            ),
                            key: SupportedChain.SOLANA
                          },
                          {
                            label: (
                              <>
                                <Avatar src={BITCOIN_LOGO} alt="Bitcoin" size={20} className="mr-2" />
                                Bitcoin
                              </>
                            ),
                            key: SupportedChain.BTC
                          }
                        ]}
                        setTab={(tab) => {
                          setChain(tab as SupportedChain);
                        }}
                        tab={chainContext.chain}
                      />
                    </div>

                    <div className="flex-center flex-col " style={{ alignItems: 'normal' }}>
                      <div className="flex-center flex-col">
                        <b className=" text-sm mb-1">Supported Wallets</b>
                        <div className="flex-center flex-col">
                          {[
                            {
                              label: (
                                <>
                                  {' '}
                                  <div className="flex" style={{ backgroundColor: 'inherit' }}>
                                    <div className="flex" style={{ backgroundColor: 'inherit' }}>
                                      <Avatar
                                        src={
                                          'https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png'
                                        }
                                        alt="WalletConnect"
                                        size={20}
                                        className="mr-1"
                                      />
                                      WalletConnect
                                    </div>
                                  </div>
                                </>
                              ),
                              value: 'Ethereum'
                            },
                            {
                              label: (
                                <>
                                  <div className="flex" style={{ backgroundColor: 'inherit' }}>
                                    <Avatar
                                      src={
                                        'https://assets-global.website-files.com/63eb7ddf41cf5b1c8fdfbc74/63fcb4fc23dfbad06e19f84b_icon-kplr-br.svg'
                                      }
                                      alt={'Keplr'}
                                      size={20}
                                      shape="square"
                                      className="mr-1"
                                    />{' '}
                                    Keplr
                                  </div>
                                </>
                              ),
                              value: 'Cosmos'
                            },
                            {
                              label: (
                                <>
                                  <div className="flex" style={{ backgroundColor: 'inherit' }}>
                                    <Avatar
                                      src={'https://moralis.io/wp-content/uploads/2023/11/Phantom-Wallet.png'}
                                      alt="Solana"
                                      size={20}
                                      className="mr-1"
                                    />
                                    Phantom
                                  </div>
                                </>
                              ),
                              value: 'Solana'
                            },
                            {
                              label: (
                                <>
                                  <div className="flex" style={{ backgroundColor: 'inherit' }}>
                                    <Avatar
                                      src={'https://moralis.io/wp-content/uploads/2023/11/Phantom-Wallet.png'}
                                      alt="Bitcoin"
                                      size={20}
                                      className="mr-1"
                                    />{' '}
                                    Phantom
                                  </div>
                                </>
                              ),
                              value: 'Bitcoin'
                            }
                          ]
                            .filter((x) =>
                              !isMobile ? true : chainContext.connected ? x.value === chainContext.chain : true
                            )
                            .filter((x) => {
                              if (chainContext.chain === SupportedChain.ETH) return x.value === chainContext.chain;
                              return x.value === chainContext.chain;
                            })
                            .map((x) => x.label)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex-center flex-col">
                  <div className="p-2 grow " style={{}}>
                    <div className="mt-2 flex-center flex-wrap">
                      {!connected && walletMode && (
                        <StyledButton onClick={async () => await chainContext.connect()}>Connect</StyledButton>
                      )}
                      {connected && walletMode && (
                        <StyledButton onClick={async () => await chainContext.disconnect()}>Disconnect</StyledButton>
                      )}
                      {(connected || !walletMode) && !signedIn && (
                        <StyledButton
                          onClick={async () => {
                            const authUrl = generateBitBadgesAuthUrl(popupParams);
                            window.location.href = authUrl;

                            if (popupParams.client_id === 'example-client-id') {
                              notification.warn({
                                message: 'Demo Client ID',
                                description:
                                  'You are using the default client ID. Please replace this with your own client ID in your .env file to ensure proper functionality.'
                              });
                            }
                          }}>
                          Sign In
                        </StyledButton>
                      )}
                      {(connected || !walletMode) && signedIn && (
                        <StyledButton
                          onClick={async () => {
                            chainContext.disconnect();
                            chainContext.setLoggedInAddress('');
                            signOut();
                          }}>
                          Sign Out
                        </StyledButton>
                      )}
                    </div>
                    {!hideLogo && (
                      <>
                        <div className="flex-center mt-3">
                          {' '}
                          {connected && <AddressDisplay addressOrUsername={address} fontSize={16} />}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
