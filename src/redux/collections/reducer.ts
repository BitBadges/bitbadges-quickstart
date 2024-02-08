import { BitBadgesApi, DesiredNumberType } from "@/chains/api";
import { AppDispatch, CollectionReducerState, GlobalReduxState } from "@/pages/_app";
import { compareObjects } from "@/utils/compare";
import { BigIntify, CollectionPermissions, deepCopy } from "bitbadgesjs-proto";
import { BitBadgesCollection, GetAdditionalCollectionDetailsRequestBody, GetCollectionBatchRouteRequestBody, GetMetadataForCollectionRequestBody, MetadataFetchOptions, convertBitBadgesCollection, pruneMetadataToFetch, updateCollectionWithResponse } from "bitbadgesjs-utils";
import { ThunkAction } from "redux-thunk";
import { initialState } from "./CollectionsContext";

const NEW_COLLECTION_ID = 0n;

export type CollectionRequestParams = { collectionId: DesiredNumberType } & GetMetadataForCollectionRequestBody & { forcefulFetchTrackers?: boolean } & GetAdditionalCollectionDetailsRequestBody;

interface UpdateCollectionsReduxAction {
  type: typeof UPDATE_COLLECTIONS;
  payload: {
    newCollection: Partial<BitBadgesCollection<DesiredNumberType> | { collectionPermissions?: Partial<CollectionPermissions<bigint>> }> & { collectionId: DesiredNumberType },
    onlyUpdateProvidedFields?: boolean;
  }
}

interface SetCollectionReduxAction {
  type: typeof SET_COLLECTION;
  payload: Partial<BitBadgesCollection<DesiredNumberType> | { collectionPermissions?: Partial<CollectionPermissions<bigint>> }> & { collectionId: DesiredNumberType }
}

const UPDATE_COLLECTIONS = 'UPDATE_COLLECTIONS';
const FETCH_COLLECTIONS_REQUEST = 'FETCH_COLLECTIONS_REQUEST';
const FETCH_COLLECTIONS_START = 'FETCH_COLLECTIONS_START';
const FETCH_COLLECTIONS_FAILURE = 'FETCH_COLLECTIONS_FAILURE';
const FETCH_COLLECTIONS_SUCCESS = 'FETCH_COLLECTIONS_SUCCESS';
const SET_COLLECTION = 'SET_COLLECTION';
const DELETE_COLLECTION = 'DELETE_COLLECTION';

interface FetchCollectionsSuccessAction {
  type: typeof FETCH_COLLECTIONS_SUCCESS;
  payload: CollectionRequestParams[];
}

interface DeleteCollectionReduxAction {
  type: typeof DELETE_COLLECTION;
  payload: DesiredNumberType;
}

interface FetchCollectionsRequestAction {
  type: typeof FETCH_COLLECTIONS_REQUEST;
  payload: CollectionRequestParams[]
}

interface FetchCollectionsStartAction {
  type: typeof FETCH_COLLECTIONS_START;
  payload: CollectionRequestParams[];
}

interface FetchCollectionsFailureAction {
  type: typeof FETCH_COLLECTIONS_FAILURE;
  payload: string; // Error message
}

type CollectionsActionTypes =
  | FetchCollectionsRequestAction
  | FetchCollectionsStartAction
  | FetchCollectionsFailureAction
  | UpdateCollectionsReduxAction
  | FetchCollectionsSuccessAction
  | SetCollectionReduxAction
  | DeleteCollectionReduxAction;

export const setCollectionRedux = (newCollection: Partial<BitBadgesCollection<DesiredNumberType> | { collectionPermissions?: Partial<CollectionPermissions<bigint>> }> & { collectionId: DesiredNumberType }): SetCollectionReduxAction => ({
  type: SET_COLLECTION,
  payload: newCollection
});

export const deleteCollectionRedux = (collectionId: DesiredNumberType): DeleteCollectionReduxAction => ({
  type: DELETE_COLLECTION,
  payload: collectionId
});

export const updateCollectionsRedux = (newCollection: Partial<BitBadgesCollection<DesiredNumberType> | { collectionPermissions?: Partial<CollectionPermissions<bigint>> }> & { collectionId: DesiredNumberType }, onlyUpdateProvidedFields: boolean): UpdateCollectionsReduxAction => ({
  type: UPDATE_COLLECTIONS,
  payload: {
    newCollection,
    onlyUpdateProvidedFields
  }
});

export const fetchCollectionsSuccess = (collections: CollectionRequestParams[]): FetchCollectionsSuccessAction => ({
  type: FETCH_COLLECTIONS_SUCCESS,
  payload: collections
});

// Define your action creators
export const fetchCollectionsRequest = (accountsToFetch: CollectionRequestParams[]): FetchCollectionsRequestAction => ({
  type: FETCH_COLLECTIONS_REQUEST,
  payload: accountsToFetch,
});

export const fetchCollectionsStart = (fetching: CollectionRequestParams[]): FetchCollectionsStartAction => ({
  type: FETCH_COLLECTIONS_START,
  payload: fetching,
});

const updateCollection = (state = initialState, newCollection: BitBadgesCollection<DesiredNumberType>, isUpdate: boolean) => {
  const collections = state.collections;
  const currCollectionState = collections[`${newCollection.collectionId}`];
  if (newCollection.collectionId === undefined) throw new Error('Collection ID not provided');

  let cachedCollection = currCollectionState ? deepCopy(convertBitBadgesCollection(currCollectionState, BigIntify)) : undefined;

  const cachedCollectionCopy = deepCopy(cachedCollection);

  if (cachedCollection && isUpdate) {
    cachedCollection = updateCollectionWithResponse(cachedCollection, newCollection);

    //Only update if anything has changed
    if (!compareObjects(cachedCollectionCopy, cachedCollection)) {
      return {
        ...state,
        collections: {
          ...collections,
          [`${newCollection.collectionId}`]: cachedCollection
        }
      };
    }

    return state;

  } else {
    return { ...state, collections: { ...collections, [`${newCollection.collectionId}`]: newCollection } }
  }
}

export const fetchAndUpdateMetadataRedux = (collectionId: DesiredNumberType, metadataToFetch: MetadataFetchOptions, fetchDirectly = false): ThunkAction<
  void,
  GlobalReduxState,
  unknown,
  CollectionsActionTypes
> => async (
  dispatch: AppDispatch,
) => {
    if (!fetchDirectly) {
      //IMPORTANT: These are just the fetchedCollections so potentially have incomplete cachedCollectionMetadata or cachedBadgeMetadata
      await dispatch(fetchCollectionsRedux([{
        collectionId: collectionId,
        metadataToFetch: metadataToFetch,
        fetchTotalAndMintBalances: true,
        handleAllAndAppendDefaults: true,
        viewsToFetch: []
      }]));
    }
  }


export const fetchCollectionsRedux = (
  collectionsToFetch: CollectionRequestParams[]
): ThunkAction<
  void,
  GlobalReduxState,
  unknown,
  CollectionsActionTypes
> => async (
  dispatch: AppDispatch,
  getState: () => GlobalReduxState
) => {
    const state = getState().collections;

    try {
      const collections = state.collections;
      if (collectionsToFetch.some(x => x.collectionId === NEW_COLLECTION_ID)) {
        throw new Error('Cannot fetch preview collection ID === 0');
      }

      //Check cache for collections. If non existent, fetch with all parameters
      //If existent, fetch with only the parameters that are missing / we do not have yet
      //If we already have everything, don't fetch and return cached value

      const batchRequestBody: GetCollectionBatchRouteRequestBody = { collectionsToFetch: [] };

      for (const collectionToFetch of collectionsToFetch) {
        const cachedCollection = collections[`${collectionToFetch.collectionId}`];
        //If we don't have the collection, add it to the batch request. Fetch requested details
        if (cachedCollection === undefined) {
          batchRequestBody.collectionsToFetch.push(collectionToFetch);
        } else {
          const prunedMetadataToFetch: MetadataFetchOptions = pruneMetadataToFetch(convertBitBadgesCollection(cachedCollection, BigIntify), collectionToFetch.metadataToFetch);
          const shouldFetchMetadata = (prunedMetadataToFetch.uris && prunedMetadataToFetch.uris.length > 0) || !prunedMetadataToFetch.doNotFetchCollectionMetadata;
          const viewsToFetch = collectionToFetch.viewsToFetch || [];
          const hasTotalAndMint = cachedCollection.owners.find(x => x.cosmosAddress === "Mint") && cachedCollection.owners.find(x => x.cosmosAddress === "Total");
          const shouldFetchTotalAndMint = !hasTotalAndMint && collectionToFetch.fetchTotalAndMintBalances;
          const shouldFetchMerkleChallengeIds = collectionToFetch.forcefulFetchTrackers || (collectionToFetch.challengeTrackersToFetch ?? []).find(x => {
            const match = cachedCollection.merkleChallenges.find(y => y.challengeId === x.challengeId && x.approverAddress === y.approverAddress && x.collectionId === y.collectionId && x.challengeLevel === y.challengeLevel)
            return !match;
          }) !== undefined;
          const shouldFetchAmountTrackerIds = collectionToFetch.forcefulFetchTrackers || (collectionToFetch.approvalTrackersToFetch ?? []).find(x => {
            const match = cachedCollection.approvalTrackers.find(y => y.amountTrackerId === x.amountTrackerId && x.approverAddress === y.approverAddress && x.collectionId === y.collectionId && y.approvedAddress === x.approvedAddress && y.trackerType === x.trackerType)
            return !match;
          }) !== undefined;

          if (shouldFetchMetadata || viewsToFetch.length > 0 || shouldFetchTotalAndMint || shouldFetchMerkleChallengeIds || shouldFetchAmountTrackerIds) {
            batchRequestBody.collectionsToFetch.push({
              ...collectionToFetch,
              metadataToFetch: prunedMetadataToFetch,
            });
          } else {
            //We already have everything we need from the collection
          }
        }
      }

      if (batchRequestBody.collectionsToFetch.length === 0) {
        return;
      }

      const res = await BitBadgesApi.getCollections(batchRequestBody);

      //Update collections map
      for (let i = 0; i < res.collections.length; i++) {
        dispatch(updateCollectionsRedux(res.collections[i], true));
      }
    } catch (err: any) {
      console.error(err);
    }
  }


export const collectionReducer = (state = initialState, action: { type: string; payload: any }): CollectionReducerState => {
  switch (action.type) {
    case 'SET_COLLECTION':
      const newCollection = action.payload as BitBadgesCollection<DesiredNumberType>;
      return updateCollection(state, newCollection, false);
    case 'DELETE_COLLECTION':
      const collectionId = action.payload as DesiredNumberType;
      const collections = state.collections;
      delete collections[`${collectionId}`];
      return { ...state, collections };
    case 'UPDATE_COLLECTIONS':
      const currCollection = state.collections[`${action.payload.newCollection.collectionId}`];
      const hasExisting = !!currCollection;

      if (!hasExisting) {
        const newCollection = action.payload.newCollection as BitBadgesCollection<DesiredNumberType>;
        return updateCollection(state, newCollection, false);
      }

      if (currCollection && hasExisting) {
        const newCollection = {
          ...currCollection,
          ...action.payload.newCollection,
          collectionPermissions: {
            ...currCollection.collectionPermissions,
            ...action.payload.newCollection.collectionPermissions
          }
        };
        return updateCollection(state, newCollection, true);
      }
      throw new Error("Collection not found and onlyUpdateProvidedFields is true");
    default:
      return state;
  }
};