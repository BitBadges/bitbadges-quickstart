import { BitBadgesApi } from '@/global/api';
import { useAccountsContext } from '@/global/contexts/AccountsContext';
import { GetSearchSuccessResponse } from 'bitbadgesjs-sdk';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { AddressDisplay } from './AddressDisplay';

export const AddressSelect = ({ onSelect }: { onSelect?: (address: string) => void }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<GetSearchSuccessResponse<bigint>>();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const { setAccounts } = useAccountsContext();

  const debouncedSearch = useCallback(
    debounce(async (input: string) => {
      if (input.trim()) {
        const res = await BitBadgesApi.getSearchResults(input);
        setSearchResult(res);
        setAccounts(res.accounts);
        setIsDropdownVisible(true);
      } else {
        setSearchResult(undefined);
        setIsDropdownVisible(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  return (
    <div className="flex-center flex-column relative">
      <div className="">
        <input
          className="input text-center dark my-2 rounded-md p-2  bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          style={{ minWidth: 300 }}
          placeholder="Enter an address or username"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        {isDropdownVisible && searchResult && (
          <div className="top-full  mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 hover:cursor-pointer ">
            {searchResult.accounts.length > 0 ? (
              searchResult.accounts.map((account) => (
                <div
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
                  key={account.address}
                  onClick={() => {
                    onSelect?.(account.address);
                    setIsDropdownVisible(false);
                    setSearchInput('');
                  }}>
                  <AddressDisplay key={account.address} addressOrUsername={account.address} hidePortfolioLink />
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500 dark:text-gray-400">No results found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
