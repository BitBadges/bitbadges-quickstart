import { getBadgeIdsString } from '@/utils/badgeIds';
import { getTimeRangesString } from '@/utils/dates';
import { iBalance } from 'bitbadgesjs-sdk';

export const BalanceDisplay = ({ balances }: { balances: iBalance<bigint>[] }) => {
  return (
    <>
      <table className="w-100 text-center">
        <tr>
          <th className="px-2">Amount</th>
          <th className="px-2">Badge IDs</th>
          <th className="px-2">Times</th>
        </tr>
        {balances.map((balance) => {
          return (
            <tr key={balance.toString()}>
              <td>x{balance.amount.toString()}</td>
              <td>{getBadgeIdsString(balance.badgeIds)}</td>
              <td>{getTimeRangesString(balance.ownershipTimes)}</td>
            </tr>
          );
        })}
        {balances.length === 0 && (
          <tr>
            <td className="secondary-text" colSpan={3}>
              No balances found
            </td>
          </tr>
        )}
      </table>
    </>
  );
};
