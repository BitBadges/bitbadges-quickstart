import { StyledButton } from '@/components/display/StyledButton';
import { getPrivateInfo, signOut } from '@/global/backend_connectors';
import { useChainContext } from '@/global/contexts/ChainContext';
import { useWalletModeContext } from '@/global/contexts/WalletModeContext';
import { Avatar, notification } from 'antd';
import { CodeGenQueryParams, SupportedChain, generateBitBadgesAuthUrl } from 'bitbadgesjs-sdk';
import getConfig from 'next/config';
import { useEffect, useState } from 'react';
import { BITCOIN_LOGO, COSMOS_LOGO, ETH_LOGO, SOLANA_LOGO } from '../../constants';
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

export const BlockinDisplay = ({ hideLogo }: { hideLogo?: boolean }) => {
  const { address, setChain, connected } = useChainContext();

  const chainContext = useChainContext();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768);
    });
  }, []);

  const [isXDefi, setIsXDefi] = useState(false);
  useEffect(() => {
    setIsXDefi(!!('xfi' in window));
  }, []);

  const signedIn = chainContext.loggedIn;
  const clientId = getConfig().publicRuntimeConfig.CLIENT_ID;
  const redirectUri = getConfig().publicRuntimeConfig.REDIRECT_URI;

  //TODO: Customize your popup parameters. See the SIWBB documentation for more details (https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/overview)
  const popupParams: CodeGenQueryParams = {
    client_id: clientId || 'example-client-id',
    redirect_uri: redirectUri //Leave undefined if not applicable and using QR codes

    // state?: string;
    // scope?: string;
    // expectAttestationsPresentations?: boolean;
    // otherSignIns?: ('discord' | 'twitter' | 'github' | 'google')[];

    // ownershipRequirements?: AssetConditionGroup<NumberType>;
    // expectVerifySuccess?: boolean;
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
                                <Avatar src={COSMOS_LOGO} alt="Cosmos" size={20} className="mr-2" />
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
                                        isXDefi
                                          ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFTklEQVRogdVaMWwTZxT+3n9Hxcke4AaOEgbAHoPTgooaKsVhAGeM2YLiKupExcBiZsoMSDAUMkVRg8RWPJJkKEGqqRwJJTbjOWTAlOtwoCrWqeTu/g5nO7Hvzj6f7SR8U/Tbvv9973/fe+9/F0IN4zNvj/xrH75JnI8DfBwHEYQ1zvnD1wsn53eWAHw/8/epbYv/AfBT+2ddV9g8JLBLf81/vUkAcD7z/u0XZHwdm5bw+VvhXObdDAEz+21NCBwRIPwnEsdNJ5B6R0QixE4QjsvAMXnnoVWDY6MCbBlA+b3dn80AcE5JEUTf9PKQRIxhJE4YPSsgNtTZE5rOUVRt5Es28m96JcPH6XymwsP8NBFjyEwISMRZ6O01nWPhuYnl1fBEuiagyITslNiT4a3ohUhXBNJjAjITAiJSn0TTgtyKid8WbVSN4D4N7MbrkyKup8WBGQ8Ak0kRj7OHoMjB9whEIDslIp0UQhvWDRSZcPdGcBIdCUynRFy+sDfG11EnEeS02xK4/J2TafYDikz4ebLz3r4EFJmQmRD7alS3uHxBQHqsPQlfApmU0JWYBoXpifaJw5OAItOex70fohJwdcw/0j0/yaQOhvF1TCb9T8GTwJmh/lXZfiAqAReHAxKISgjUlO01Lp71jgoXgUFW2nbIl2wsFSzfNsKv99rfPFnDUsHC/acmAGB5leHujUOu70QlJ7loejPBAxHsG7v6yS3D/3uJmDs6XAQ0nXfVDfYD6aSA2AkG5Sjhx5S/T6Me4e0ZQmqFYyS+d1pQZMKjW+6waUVEcq950n1V6t+9ddDwJLC8arnEchBQ9dCHJ4EtA7hXywoHCdpHt1N9FVNUbTzOWYMxROehTljT3Wtt60BuxUTV4H3rTKsGx+8vbTxbsUDgmEyKgfuuLQMoV9za7FjIlgsWiqqN6ZSAKyE7VE3nWFp1DK+naEUmjHjkdT9seBgPBKzEms5x/6mJJ4sWEnGGi8OE2BDzPRVN5yhXbBTLzhCr3DL4aJ1uzOZMbBnt7yBLPiMXTwL1B7cWNE3nWC5YWC7srLVu2C62nSuq2PiNpnPcmdtuEPxhmKDI7lPWdI68T2p3EYhIzoU6KgELz00Uy+0F10mM9dFjOik0OaauhbqTslMiRmsd5525bYwOs0bIrqv+syIXgePyTuOUveZUx3oYFFUbVQP4oHNXSlOOEqISQZEBRQYScQEjcWrqbqsGx2LBRu7lTp2JSIRbU0LD+NmciXzJxpkTrOGgJ4v+2dB3Mle/UPfjbrCu2nj1xsZSodmTiRhD9tpOSM3mTDxbsRAbIjzKftW05gdfETuxbkGRqSFcRWY4LvvfGaoGb6S7DzpQKttYV93NoSITMimhce+uGhy/zJkoqjYUmXD7J+fk8yWrrfFAiOHubiN2I0hhSsQY0knWdLvKlyzce+poYfdUTtM5bv263fG5oS80QQyOSE6uT8QZrlxgTSe3rtp4sujUGKA5nIIaH5pAIs4QPew0VxHJET3gvJVRZEfMsSFynVLV4FArvMnwiES4OsYwXRuidWN8aALTKQEjAd8PaDrHumqjVLbxZ6lZD611YV21cWfO7OpCFYrARoUjKvGG5z/UvKXpjoj/+chr1dhdQ/zqwsJiZ8F6IbSIu0Em5eT51gzmVdC6xZ5MJY7J1KgndR141YUwEAF6Meh/LXj1xtFAucJdjV0vIMKaSMRXOMdACfg1Yr3C5vwhM9nnByDaHMgOgwRh8/XCyXm2Nn/6k8Xo0hdFgrBpMXbJ+XMXzmXezTCim5yjp7f3gwKBXoBbK6ZoPlibP/0JAP4HIf5rn2DrOnEAAAAASUVORK5CYII='
                                          : 'https://assets-global.website-files.com/63eb7ddf41cf5b1c8fdfbc74/63fcb4fc23dfbad06e19f84b_icon-kplr-br.svg'
                                      }
                                      alt={isXDefi ? 'XDEFI' : 'Keplr'}
                                      size={20}
                                      shape="square"
                                      className="mr-1"
                                    />{' '}
                                    {isXDefi ? 'XDEFI' : 'Keplr'}
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
