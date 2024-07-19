import { useCollection } from '@/chains/chain_contexts/CollectionsContext';
import { Avatar } from 'antd';

export const MetadataDisplay = ({ collectionId }: { collectionId: bigint }) => {
  const collection = useCollection(collectionId);
  const badgeIdOneMetadata = collection?.getBadgeMetadata(1n);
  const collectionMetadata = collection?.getCollectionMetadata();

  return (
    <>
      <div className="flex-center flex-wrap">
        <div className="mx-8">
          <div className="text-center my-3">
            Collection {collection?.collectionId.toString()}: {collectionMetadata?.name}
          </div>
          <div className="flex-center">
            <Avatar
              src={collectionMetadata?.image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')}
              size={120}
              shape="square"
              className="rounded-lg cursor-pointer hover:scale-110"
              onClick={() => window.open(`https://bitbadges.io/collections/${collectionId}`)}
            />
          </div>
        </div>
        <div className="mx-8">
          <div className="text-center my-3">Badge 1: {badgeIdOneMetadata?.name}</div>
          <div className="flex-center">
            <Avatar
              src={badgeIdOneMetadata?.image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')}
              size={120}
              shape="square"
              className="rounded-lg cursor-pointer hover:scale-110"
              onClick={() => window.open(`https://bitbadges.io/collections/${collectionId}/1`)}
            />
          </div>
        </div>
      </div>
    </>
  );
};
