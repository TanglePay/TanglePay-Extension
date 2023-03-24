import React from 'react'
import { useStore } from '@tangle-pay/store'
import { useGetNftList } from '@tangle-pay/store/nft'

export const AssetsNftMerge = () => {
    const [isRequestNft] = useStore('nft.isRequestNft')
    useGetNftList()
    const [list] = useStore('nft.list')
    console.log(list)
    return <div className='page assets-trading'></div>
}
