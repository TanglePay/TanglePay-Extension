import React, { useState } from 'react'
import { useStore } from '@tangle-pay/store'
import { useGetNftList } from '@tangle-pay/store/nft'
import { Button } from 'antd-mobile'
import { SvgIcon } from '@/common'
import Bridge from '@/common/bridge'

export const AssetsNftMerge = () => {
    const [isRequestNft] = useStore('nft.isRequestNft')
    useGetNftList()
    const [list] = useStore('nft.list')
    // const icebergList = list.find((e) => e.name === 'Iceberg Legends')
    const icebergList = list.find((e) => e.name === 'Other collections')
    const nftList = icebergList?.list || []
    const [selectList, setSelectList] = useState([])
    const isDisabled = selectList.length != 3
    return (
        <div className='page assets-trading'>
            <div className='flex ac jsb p16 border-b'>
                <div className='fz18 fw600'>选择 Hero Tier</div>
                <Button
                    className='fz16 ph24'
                    disabled={isDisabled}
                    onClick={() => {
                        const infoList = []
                        nftList.forEach((e) => {
                            if (selectList.includes(e.nftId)) {
                                infoList.push(e)
                            }
                        })
                        Bridge.sendMessage('iota_merge_nft', infoList)
                    }}
                    style={{
                        borderRadius: 4,
                        border: 0,
                        background: isDisabled ? 'rgba(54, 113, 238, 0.2)' : 'rgba(54, 113, 238, 1)'
                    }}
                    color='primary'>
                    添加
                </Button>
            </div>
            <div>
                <div className='fz18 pv8 ph16'>共 {nftList.length} 项</div>
                <div className='ph8'>
                    {nftList.map((e) => {
                        const isSelect = selectList.includes(e.nftId)
                        const ar = (e?.attributes || []).find((d) => d.trait_type == 'airdroprewardlevel')?.value || ''
                        return (
                            <div
                                className='flex ac jsb p8 pr20 bgS radius8 press mb8'
                                key={e.nftId}
                                onClick={() => {
                                    let newList = [...selectList]
                                    if (isSelect) {
                                        newList.splice(selectList.indexOf(e.nftId), 1)
                                    } else {
                                        if (newList.length >= 3) {
                                            newList.shift()
                                        }
                                        newList.push(e.nftId)
                                    }
                                    setSelectList(newList)
                                }}>
                                <div className='flex ac'>
                                    <img
                                        className='bgS'
                                        style={{
                                            borderRadius: 8,
                                            width: 64,
                                            height: 64,
                                            objectFit: 'contain'
                                        }}
                                        src={e.thumbnailImage || e.media}
                                    />
                                    <div className='ml12 fz18 fw500'>AR: {ar}</div>
                                </div>
                                <SvgIcon name='eye_1' className={isSelect ? 'cP' : 'cS'} size='20' />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
