import { useState } from 'react';

export const ClaimHelpers = () => {
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);

  return (
    <>
      <br />
      <div className="flex-center">
        <button
          className="landing-button"
          onClick={() => setPasswordIsVisible(!passwordIsVisible)}
          style={{ width: 200 }}
        >
          {passwordIsVisible ? 'Hide' : 'Check Something'}
        </button>
      </div>
      <br />
      {/* TODO: You will need to store the password and/or codes somewhere. */}
      {passwordIsVisible && (
        <>
          <div className="text-center">
            Password: abc123
            <br />
            Code: 123456
          </div>
          <div className="text-center">
            <a
              href="https://bitbadges.io/collections/ADD_COLLECTION_ID_HERE?approvalId=APPROVAL_ID&code=CODE"
              target="_blank"
              rel="noreferrer"
            >
              Code Claim Link
            </a>
            <br />
            <a
              href="https://bitbadges.io/collections/ADD_COLLECTION_ID_HERE?approvalId=APPROVAL_ID&password=PASSWORD"
              target="_blank"
              rel="noreferrer"
            >
              Password Claim Link
            </a>
          </div>
          <div className="text-center">
            <a href="https://bitbadges.io/saveforlater?value=abc123" target="_blank" rel="noreferrer">
              Save for Later Link
            </a>
          </div>
        </>
      )}
    </>
  );
};
