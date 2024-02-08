import { Stringify, UintRange } from 'bitbadgesjs-proto';
import { AccountFetchDetails, AccountViewKey, AddressListDoc, AnnouncementDoc, BalanceDoc, BigIntify, BitBadgesUserInfo, BlockinAuthSignatureDoc, ClaimAlertDoc, ListActivityDoc, MINT_ACCOUNT, ReviewDoc, TransferActivityDoc, UpdateAccountInfoRouteRequestBody, convertBitBadgesUserInfo, convertToCosmosAddress, isAddressValid } from 'bitbadgesjs-utils';
import { useSelector } from 'react-redux';
import { deleteAccountsRedux, fetchAccountsRedux, updateAccountsRedux } from './reducer';
import { BitBadgesApi, DesiredNumberType } from '@/chains/api';
import { store, GlobalReduxState, AccountReducerState, dispatch } from '@/pages/_app';

export const defaultAccount = convertBitBadgesUserInfo(MINT_ACCOUNT, Stringify)

export function useAccount(_addressOrUsername?: string) {
  const addressOrUsername = _addressOrUsername?.trim() || '';

  const cosmosAddress = reservedNames.includes(addressOrUsername) ? addressOrUsername :
    isAddressValid(addressOrUsername) ? convertToCosmosAddress(addressOrUsername) : '';

  const accountsKey = isAddressValid(addressOrUsername) || reservedNames.includes(addressOrUsername)
    ? cosmosAddress : store.getState().accounts.cosmosAddressesByUsernames[addressOrUsername];

  const accountToReturn = useSelector((state: GlobalReduxState) => state.accounts.accounts[accountsKey]);
  return accountToReturn;
}


export const initialState: AccountReducerState = {
  accounts: {
    'Mint': MINT_ACCOUNT,
    'Total': MINT_ACCOUNT,
    'All': {
      ...MINT_ACCOUNT,
      address: 'All',
      cosmosAddress: 'All',
    },
  },
  cosmosAddressesByUsernames: {},
};

export const reservedNames = ['Mint', 'Total', 'All'];

export const getAccount = (addressOrUsername: string, forcefulRefresh?: boolean) => {
  if (reservedNames.includes(addressOrUsername)) return { ...MINT_ACCOUNT, address: addressOrUsername, cosmosAddress: addressOrUsername };

  let accountToReturn;

  const state = store.getState();
  const accounts = state.accounts.accounts;
  const cosmosAddressesByUsernames = state.accounts.cosmosAddressesByUsernames;

  if (isAddressValid(addressOrUsername)) {
    const cosmosAddress = convertToCosmosAddress(addressOrUsername);
    if (forcefulRefresh) accountToReturn = undefined;
    else accountToReturn = accounts[cosmosAddress];
  } else {
    accountToReturn = accounts[cosmosAddressesByUsernames[addressOrUsername]];
  }
  return accountToReturn ? convertBitBadgesUserInfo(accountToReturn, BigIntify) : undefined;
}

export const updateAccounts = (userInfos: BitBadgesUserInfo<DesiredNumberType>[], forcefulRefresh?: boolean) => {
  if (forcefulRefresh) {
    dispatch(deleteAccountsRedux(userInfos.map(x => x.address || x.username) as string[]));
  }

  dispatch(updateAccountsRedux(userInfos, forcefulRefresh));
}


export const updateAccount = (account: BitBadgesUserInfo<DesiredNumberType>, forcefulRefresh?: boolean) => {
  updateAccounts([account], forcefulRefresh)
}

//IMPORTANT: addressOrUsername must be the user's current signed in address or username, or else this will not work
export const updateProfileInfo = async (addressOrUsername: string, newProfileInfo: UpdateAccountInfoRouteRequestBody<bigint>) => {
  const account = getAccount(addressOrUsername);
  if (!account) throw new Error(`Account ${addressOrUsername} not found`);
  await BitBadgesApi.updateAccountInfo(newProfileInfo);
  const newAccount: BitBadgesUserInfo<bigint> = {
    ...account,
    ...newProfileInfo,
    seenActivity: newProfileInfo.seenActivity ? BigInt(newProfileInfo.seenActivity) : account.seenActivity,
  };

  updateAccount(newAccount);
  return newAccount;
}


export const fetchAccounts = async (addressesOrUsernames: string[], forcefulRefresh?: boolean) => {
  return await fetchAccountsWithOptions(addressesOrUsernames.map(addressOrUsername => {
    return {
      address: isAddressValid(addressOrUsername) ? addressOrUsername : undefined,
      username: isAddressValid(addressOrUsername) ? undefined : addressOrUsername,
      fetchSequence: false,
      fetchBalance: false,
      viewsToFetch: []
    }
  }), forcefulRefresh);
}

export const fetchAccountsWithOptions = async (accountsToFetch: AccountFetchDetails[], forcefulRefresh?: boolean) => {
  if (accountsToFetch.length === 0) return;

  if (forcefulRefresh) {
    dispatch(deleteAccountsRedux(accountsToFetch.map(x => x.address || x.username) as string[]));
  }

  dispatch(fetchAccountsRedux(accountsToFetch));
}

export function viewHasMore(addressOrUsername: string, viewId: string) {
  const account = getAccount(addressOrUsername);
  if (!account) return true;

  return account.views[viewId]?.pagination?.hasMore || true;
}

export async function fetchNextForAccountViews(addressOrUsername: string, viewType: AccountViewKey, viewId: string, specificCollections?: {
  collectionId: bigint,
  badgeIds: UintRange<bigint>[]
}[],
  specificLists?: string[], oldestFirst?: boolean) {

  const currPagination = getAccount(addressOrUsername)?.views[viewId]?.pagination;
  const hasMore = currPagination?.hasMore || true;
  const bookmark = currPagination?.bookmark || '';
  if (!hasMore) return;

  await fetchAccountsWithOptions([{
    address: isAddressValid(addressOrUsername) ? addressOrUsername : undefined,
    username: isAddressValid(addressOrUsername) ? undefined : addressOrUsername,
    viewsToFetch: [{
      viewId: viewId,
      specificLists,
      viewType,
      specificCollections,
      bookmark: bookmark,
      oldestFirst
    }]
  }]);
}

export function getAuthCodesView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.authCodes.find(y => y._docId === x);
  }) ?? []) as BlockinAuthSignatureDoc<bigint>[];
}


export function getAccountActivityView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.activity.find(y => y._docId === x);
  }) ?? []) as TransferActivityDoc<bigint>[];
}

export function getAccountListsActivityView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.listsActivity.find(y => y._docId === x);
  }) ?? []) as ListActivityDoc<bigint>[];
}


export function getAccountReviewsView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.reviews.find(y => y._docId === x);
  }) ?? []) as ReviewDoc<bigint>[];
}

export function getAccountAnnouncementsView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.announcements.find(y => y._docId === x);
  }) ?? []) as AnnouncementDoc<bigint>[];
}

export function getAccountBalancesView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.collected.find(y => y._docId === x)
  }) ?? []) as BalanceDoc<bigint>[];
}

export function getAccountAddressListsView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.addressLists.find(y => y.listId === x);
  }) ?? []) as AddressListDoc<bigint>[];
}

export function getAccountClaimAlertsView(account: BitBadgesUserInfo<bigint> | undefined, viewId: string) {
  if (!account) return [];

  return (account.views[viewId]?.ids.map(x => {
    return account.claimAlerts.find(y => y._docId === x);
  }) ?? []) as ClaimAlertDoc<bigint>[];
}


export const incrementSequence = (addressOrUsername: string) => {
  const account = getAccount(addressOrUsername);
  if (account) {
    account.sequence = account.sequence ? account.sequence + 1n : 1n;
  } else {
    throw new Error(`Account ${addressOrUsername} not found`);
  }

  updateAccount(account);
}

export const setPublicKey = (addressOrUsername: string, publicKey: string) => {
  const account = getAccount(addressOrUsername);
  if (!account) {
    throw new Error(`Account ${addressOrUsername} not found`);
  }

  dispatch(updateAccountsRedux([{
    ...account,
    publicKey: publicKey
  }], false))
}
