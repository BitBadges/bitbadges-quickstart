import { ConnectDisplay, GatedInfoButton } from '@/components/ConnectWallet';
import { StyledButton } from '@/components/display/StyledButton';
import { TabDisplay } from '@/components/display/TabDisplay';
import { UserQueryInfo } from '@/components/QueryUserInfo';
import { useAccount } from '@/global/contexts/AccountsContext';
import { useChainContext } from '@/global/contexts/ChainContext';
import { getBitBadgesTxContextFromAccount } from '@/global/contexts/utils';
import { Col, notification } from 'antd';
import { createTransactionPayload, proto } from 'bitbadgesjs-sdk';
import { NextPage } from 'next/types';
import { ReactNode } from 'react';
import { BroadcastTxPopupButton } from '../components/BitBadgesTxnPopup';
import Header from '../components/Header';
import { useWalletModeContext } from '@/global/contexts/WalletModeContext';

const Home: NextPage = () => {
  const chainContext = useChainContext();
  const signedInAccount = useAccount(chainContext.address);
  const { walletMode } = useWalletModeContext();

  const tabs: { label: string; description: string; node: ReactNode; noTitle?: boolean }[] = [
    {
      label: 'Authentication',
      description:
        'Depending on your use case, you may need to authenticate users, request signatures, and/or interact with wallets.',
      node: (
        <>
          <div className="flex-center flex-wrap" style={{ alignItems: 'normal' }}>
            <Col md={24} xs={24} sm={24}>
              <ConnectDisplay />
              <br />
              <br />
              <div className="flex-center flex-wrap">
                <GatedInfoButton />
                {walletMode && (
                  <>
                    <StyledButton
                      className="text-xs"
                      disabled={!chainContext.connected}
                      onClick={async () => {
                        try {
                          await chainContext.signMessage('Hello World');
                        } catch (e) {
                          console.error(e);
                        }
                      }}>
                      Sign Message
                    </StyledButton>
                    <StyledButton
                      className="text-xs"
                      disabled={!chainContext.connected || !signedInAccount}
                      onClick={async () => {
                        try {
                          if (!signedInAccount) {
                            throw new Error('No signed in account');
                          }

                          if (signedInAccount.accountNumber <= 0) {
                            notification.error({
                              message: 'Account has not been registered',
                              description:
                                'This account must be registered on the BitBadges blockchain before it can send a transaction. To register, they must receive a $BADGE credit via a transfer.'
                            });
                          }

                          const txContext = getBitBadgesTxContextFromAccount(signedInAccount, {
                            amount: `0`,
                            denom: 'ubadge',
                            gas: `40000000`
                          });

                          await chainContext.signBitBadgesTxn(
                            txContext,
                            createTransactionPayload(txContext, [
                              new proto.cosmos.bank.v1beta1.MsgSend({
                                fromAddress: signedInAccount?.cosmosAddress ?? '',
                                toAddress: 'cosmos1zd5dsage58jfrgmsu377pk6w0q5zhc67fn4gsl',
                                amount: [{ denom: 'ubadge', amount: '1' }]
                              })
                            ]),
                            false
                          );
                        } catch (e) {
                          console.error(e);
                        }
                      }}>
                      Sign BitBadges Txn (In-Site)
                    </StyledButton>{' '}
                  </>
                )}
                <BroadcastTxPopupButton />
              </div>
            </Col>
          </div>
          <br />
          <br />
          <div className="text-xs text-center  secondary-text">
            Tip: Combine this step with queries (e.g. badge ownership) to further gate content or use other information
            to customize experiences out of the box (e.g. dark mode protocols).
          </div>
        </>
      )
    },
    {
      label: 'Queries',
      description:
        'Search for public information on BitBadges or other platforms like balances, protocols, and more. BitBadges is useful because everything is consolidated to a single interface for any chain.',
      node: <UserQueryInfo />
    }
  ];

  return (
    <>
      <Header />
      <TabDisplay tabs={tabs} />
    </>
  );
};

export default Home;
