import { notification } from 'antd';
import { StyledButton } from './display/StyledButton';
import { ClaimHelpers } from './DistributeClaimInfo';

export const BitBadgesClaimHelper = () => {
  return (
    <>
      <div className="mt-4">
        <div className="primary-text font-bold font-xl">1. All In-Site</div>
        <div className="secondary-text">
          Most claims can be completely implemented on the BitBadges site with custom plugins and no extra code
          required. Users will claim on the claim page. If you want to gate claims with unsupported custom criteria, see
          the steps below. You could also consider creating your own custom plugin.
        </div>{' '}
        <div className="flex-center">
          <StyledButton
            className="mt-4"
            onClick={async () => {
              window.open('https://bitbadges.io/claims/directory', '_blank');
            }}>
            Custom Plugins
          </StyledButton>
          <StyledButton
            className="mt-4"
            onClick={async () => {
              window.open(
                'https://docs.bitbadges.io/for-developers/claim-builder/plugins/creating-a-custom-plugin',
                '_blank'
              );
            }}>
            Create a Custom Plugin
          </StyledButton>
        </div>
      </div>{' '}
      <div className="mt-4">
        <div className="primary-text font-bold font-xl">2. Auto-Claiming</div>
        <div className="secondary-text">
          Setup the claim and auto-claim on behalf of users. This can be done through the BitBadges API or through
          Zapier. The claim creation process will walk you through this.
        </div>
      </div>
      <div className="flex-center">
        <StyledButton
          className="m-2"
          onClick={async () => {
            notification.info({
              message: 'Auto-Claim',
              description: 'See the /autoclaim endpoint'
            });
          }}>
          Auto-Claim
        </StyledButton>
        <StyledButton
          className="m-2"
          onClick={async () => {
            window.open('https://zapier.com/apps/bitbadges', '_blank');
          }}>
          Zapier
        </StyledButton>
      </div>
      <div className="mt-4">
        <div className="primary-text font-bold font-xl">3. In-Site + Custom Criteria</div>
        <div className="secondary-text">
          Setup the claim only with in-site plugins on the BitBadges site. For implementing custom criteria, consdier
          using generic ones like codes, passwords, or emails. You then gate such information to users how you would
          like using a custom implementation (e.g. payments, private database checks, etc). Claiming will be done by
          users on the BitBadges site by providing the required information.
        </div>
      </div>
      <ClaimHelpers />
    </>
  );
};
