import { ReactNode } from 'react';

import { AddressWithBlockies } from './AddressWithBlockies';

export function AddressDisplayTitle({ title, icon }: { title: string | ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex-between" style={{ fontSize: 20 }}>
      <b>{title ? title : 'Add Addresses'}</b>
      <div>{icon}</div>
    </div>
  );
}

export function AddressDisplay({
  addressOrUsername,
  title,
  icon,
  fontColor,
  fontSize,
  hidePortfolioLink,
  hideTooltip,
  doNotShowName
}: {
  addressOrUsername: string;
  title?: string | ReactNode;
  icon?: ReactNode;
  fontColor?: string;
  fontSize?: number;
  hideChains?: boolean;
  hidePortfolioLink?: boolean;
  hideTooltip?: boolean;
  doNotShowName?: boolean;
}) {
  return (
    <>
      {title && <AddressDisplayTitle title={title} icon={icon} />}
      <div className="flex" style={{ paddingRight: 0, alignItems: 'center' }}>
        <AddressWithBlockies
          addressOrUsername={addressOrUsername}
          fontSize={fontSize}
          fontColor={fontColor}
          hidePortfolioLink={hidePortfolioLink}
          hideTooltip={hideTooltip}
          doNotShowName={doNotShowName}
        />
        {icon && (
          <div className="flex-center primary-text" style={{ color: fontColor ?? undefined }}>
            <div style={{ marginLeft: 8 }}>{icon}</div>
          </div>
        )}
      </div>
    </>
  );
}
