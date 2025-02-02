import TimelineShimmer from '@components/Shimmers/TimelineShimmer'
import { NoDataFound } from '@components/UIElements/NoDataFound'
import { POLYGON_CHAIN_ID, SCROLL_ROOT_MARGIN } from '@lenstube/constants'
import type { Nft, Profile } from '@lenstube/lens'
import { useProfileNfTsQuery } from '@lenstube/lens'
import { Loader } from '@lenstube/ui'
import { t } from '@lingui/macro'
import type { FC } from 'react'
import React from 'react'
import { useInView } from 'react-cool-inview'
import { mainnet } from 'wagmi/chains'

import NFTCard from './NFTCard'

type Props = {
  channel: Profile
}

const CollectedNFTs: FC<Props> = ({ channel }) => {
  const request = {
    limit: 32,
    chainIds: [POLYGON_CHAIN_ID, mainnet.id],
    ownerAddress: channel.ownedBy
  }

  const { data, loading, error, fetchMore } = useProfileNfTsQuery({
    variables: {
      request
    }
  })

  const collectedNFTs = data?.nfts?.items as Nft[]
  const pageInfo = data?.nfts?.pageInfo

  const { observe } = useInView({
    rootMargin: SCROLL_ROOT_MARGIN,
    onEnter: async () => {
      await fetchMore({
        variables: {
          request: {
            ...request,
            cursor: pageInfo?.next
          }
        }
      })
    }
  })

  if (loading) {
    return <TimelineShimmer />
  }

  if (data?.nfts?.items?.length === 0) {
    return <NoDataFound isCenter withImage text={t`No NFTs found`} />
  }

  return (
    <div className="w-full">
      {!error && !loading && (
        <>
          <div className="laptop:grid-cols-4 grid-col-1 grid gap-x-4 gap-y-2 md:grid-cols-2 md:gap-y-8 2xl:grid-cols-5">
            {collectedNFTs?.map((nft: Nft) => (
              <NFTCard
                key={`${nft.contractAddress}_${nft.tokenId}`}
                nft={nft}
              />
            ))}
          </div>
          {pageInfo?.next && (
            <span ref={observe} className="flex justify-center p-10">
              <Loader />
            </span>
          )}
        </>
      )}
    </div>
  )
}

export default CollectedNFTs
