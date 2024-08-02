import { BitBadgesApi } from '@/bitbadges-api';
import { useAccount } from '@/global/contexts/AccountsContext';
import { JsonBodyInputSchema, MapWithValues } from 'bitbadgesjs-sdk';
import { useEffect, useState } from 'react';

export const Protocols: {
  name: string;
  description: string;
  mapId: string;
  isCollectionProtocol?: boolean;
}[] = [
  {
    name: 'Experiences Protocol',
    description: 'Share how your experiences went with specific users via badges.',
    mapId: 'Experiences Protocol',
    isCollectionProtocol: true
  },
  {
    name: 'BitBadges Follow Protocol',
    description: 'Share who you follow and who follows you via badges.',
    mapId: 'BitBadges Follow Protocol',
    isCollectionProtocol: true
  },
  {
    name: 'Dark Mode Protocol',
    description: 'Set if you prefer dark mode or not.',
    mapId: 'Dark Mode Protocol'
  },
  {
    name: 'Alternate Address Protocol',
    description: 'Set an alternate address as a backup.',
    mapId: 'Alternate Address Protocol'
  }
];

export const AttrTypeInputDisplay = ({ type, value }: { type: string; value: any }) => {
  if (type === 'string' || type === 'url') {
    return <>{value}</>;
  } else if (type === 'number') {
    return <>{value}</>;
  } else if (type === 'date') {
    return <>{new Date(value).toLocaleDateString()}</>;
  } else if (type === 'boolean') {
    return <>{value ? 'Yes' : 'No'}</>;
  }

  return null;
};

export const ApiQueryInputDisplay = ({
  value,
  schema
}: {
  value: any;
  schema?: JsonBodyInputSchema | { key: string; label: string; type: 'ownershipRequirements' };
}) => {
  if (!schema) {
    let type = value === 'true' || value === 'false' ? 'boolean' : typeof value;

    return <AttrTypeInputDisplay type={type} value={value} />;
  }

  return null;
};

export const ProtocolsDisplay = ({ addressOrUsername }: { addressOrUsername?: string }) => {
  const [maps, setMaps] = useState<MapWithValues<bigint>[] | null>(null);
  const account = useAccount(addressOrUsername ?? '');

  useEffect(() => {
    async function getMaps() {
      const res = await BitBadgesApi.getMaps({
        mapIds: Protocols.map((protocol) => protocol.mapId)
      });
      if (!res) return;
      setMaps(res.maps);
    }
    getMaps();
  }, []);

  const MapRowUI = ({
    map,
    idx,
    isCollectionProtocol
  }: {
    isCollectionProtocol?: boolean;
    map: MapWithValues<bigint>;
    idx: number;
  }) => {
    const userValue = map.values[account?.cosmosAddress ?? '']?.value;
    const image = map.metadata?.image;
    // const description = Protocols.find((protocol) => protocol.mapId === map.mapId)?.description ?? map.metadata?.description;
    return (
      <div
        key={idx}
        className={`${idx > 0 ? 'mt-2' : ''} rounded-lg flex  p-2 border-2 border-gray-300 bg-gray-100 hover:bg-gray-200
dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 cursor-pointer`}
        onClick={() => {
          window.open('https://bitbadges.io/maps/' + map.mapId, '_blank');
        }}>
        <div className="flex-center" style={{ minWidth: 55 }}>
          {typeof image === 'string' ? (
            <img
              src={image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')}
              className=""
              style={{ width: 50, height: 50 }}
            />
          ) : (
            image
          )}
        </div>
        <div className="flex flex-col flex-wrap text-start ml-2">
          <div className="font-bold text-md">{map.metadata?.name}</div>
          <div className="secondary-text">
            {isCollectionProtocol && (
              <>
                {userValue ? (
                  <a
                    className="text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://bitbadges.io/collections/' + userValue?.toString(), '_blank');
                    }}>
                    Collection ID: {userValue?.toString()}
                  </a>
                ) : (
                  'Collection ID: Not Set'
                )}
              </>
            )}
            {!isCollectionProtocol ? (
              userValue ? (
                <>
                  <b>Value:</b> <ApiQueryInputDisplay value={userValue} />
                </>
              ) : (
                'Value: Not Set'
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="rounded-lg px-1 mt-2 custom-scrollbar text-start" style={{ maxHeight: 800, overflowY: 'auto' }}>
        {Protocols.map((protocol, idx) => {
          const map = maps?.find((map) => map.mapId === protocol.mapId);
          if (!map) return null;
          return <MapRowUI key={idx} map={map} idx={idx} isCollectionProtocol={protocol.isCollectionProtocol} />;
        })}
      </div>
    </>
  );
};
