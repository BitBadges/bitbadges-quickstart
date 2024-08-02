
import { AddressWithBlockies } from './AddressWithBlockies';

export function AddressDisplay({
  addressOrUsername,
  fontColor,
  fontSize,
  hidePortfolioLink
}: {
  addressOrUsername: string;
  fontColor?: string;
  fontSize?: number;
  hidePortfolioLink?: boolean;
}) {
  return (
    <>
      <div className="flex" style={{ alignItems: 'center' }}>
        <AddressWithBlockies
          addressOrUsername={addressOrUsername}
          fontSize={fontSize}
          fontColor={fontColor}
          hidePortfolioLink={hidePortfolioLink}
        />
      </div>
    </>
  );
}
