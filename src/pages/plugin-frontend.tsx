import { InfoCircleOutlined } from '@ant-design/icons';
import { Layout, notification } from 'antd';
import { useState } from 'react';
import { DisplayCard } from '../components/display/DisplayCard';
// import { InformationDisplayCard } from '../components/display/InformationDisplayCard';

const FRONTEND_URL = 'https://bitbadges.io';
const { Content } = Layout;

function PluginTestScreen() {
  const [customBody, setCustomBody] = useState<object>({
    testData: 'testData'
  });

  // If you need to access the context passed, you can do so using the following code:
  // const router = useRouter();
  // const { context } = router.query;
  // let claimContext;
  // try {
  //   claimContext = JSON.parse(context?.toString() || '');
  // } catch (e) {
  //   claimContext = undefined;
  //   console.error('Error parsing context', e);
  // }

  return (
    <Content className="full-area" style={{ minHeight: '100vh', padding: 8 }}>
      <div className="flex-center">
        <DisplayCard title="User Inputs - Plugin Logic" md={12} xs={24} sm={24} style={{ marginTop: '10px' }}>
          {/* 
            //TODO: Add your custom logic here to prompt the user for any additional information required for the claim. 
          */}
          <div className="my-20"></div>
          <div className="flex-center">
            <button
              className="landing-button"
              style={{ width: '90%' }}
              onClick={async () => {
                notification.success({
                  message: 'Message Sent',
                  description: 'The message has been sent to BitBadges.'
                });

                if (window.opener) {
                  console.log('Sending message to opener', customBody, FRONTEND_URL);
                  window.opener.postMessage(customBody, FRONTEND_URL);
                  setCustomBody({});
                  window.close(); // We recommend closing the window after sending the message for a better user experience.
                }
              }}
            >
              Submit
            </button>
          </div>
          <div className="secondary-text" style={{ textAlign: 'center', marginTop: '10px' }}>
            <InfoCircleOutlined /> The selected data will be sent to BitBadges for completing the claim.
          </div>
        </DisplayCard>
      </div>
    </Content>
  );
}

export default PluginTestScreen;
