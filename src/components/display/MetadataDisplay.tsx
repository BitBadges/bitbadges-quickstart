import { useCollection } from '@/global/contexts/CollectionsContext';
import { Avatar, Tooltip } from 'antd';

export const BadgeMetadataDisplay = ({ badgeId, collectionId }: { badgeId: bigint; collectionId: bigint }) => {
  const collection = useCollection(collectionId);
  const badgeIdOneMetadata = collection?.getBadgeMetadata(badgeId);

  return (
    <div className="">
      <Tooltip title={badgeIdOneMetadata?.name} placement="bottom">
        <Avatar
          src={badgeIdOneMetadata?.image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')}
          size={100}
          shape="square"
          className="rounded-lg cursor-pointer hover:scale-110 "
          onClick={() => window.open(`https://bitbadges.io/collections/${collectionId}/1`)}
        />
      </Tooltip>
    </div>
  );
};

export const CollectionMetadataDisplay = ({ collectionId }: { collectionId: bigint }) => {
  const collection = useCollection(collectionId);
  const collectionMetadata = collection?.getCollectionMetadata();

  return (
    <>
      <div className="flex-center mt-4 flex-wrap">
        <div className="mx-8">
          <div className="flex-center">
            <Avatar
              src={collectionMetadata?.image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')}
              size={80}
              shape="square"
              className="rounded-lg cursor-pointer hover:scale-110"
              onClick={() => window.open(`https://bitbadges.io/collections/${collectionId}`)}
            />
          </div>
          <div className="text-center my-3 font-bold text-md">
            <a href={`https://bitbadges.io/collections/${collectionId}`}>{collectionMetadata?.name}</a>
          </div>
        </div>
      </div>
    </>
  );
};
