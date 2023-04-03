import React, { useEffect, useState } from 'react'
import { useStore } from '@tangle-pay/store'
import { useGetNftList } from '@tangle-pay/store/nft'
import { Button } from 'antd-mobile'
import { SvgIcon, Toast } from '@/common'
import { Base, I18n } from '@tangle-pay/common'
import Bridge from '@/common/bridge'
import { useLocation } from 'react-router-dom'

export const AssetsNftMerge = () => {
    const [isRequestNft] = useStore('nft.isRequestNft')
    let params = useLocation()
    params = Base.handlerParams(params.search)
    try {
        params = params?.params
        params = JSON.parse(params)
    } catch (error) {
        params = {}
    }
    useGetNftList()
    const [list] = useStore('nft.list')
    let allNftList = []
    list.forEach((e) => {
        if (e.list) {
            e.list.forEach((d) => {
                allNftList.push({
                    ...d,
                    space: e.space
                })
            })
        }
    })
    let filterNftList = []
    allNftList.forEach((e) => {
        let isPush = true
        for (const i in params) {
            if (Object.hasOwnProperty.call(params, i)) {
                const item = params[i]
                if (Array.isArray(item)) {
                    if (!item.includes(e[i])) {
                        isPush = false
                    }
                } else {
                    if (item != e[i]) {
                        isPush = false
                    }
                }
            }
        }
        if (isPush) {
            filterNftList.push(e)
        }
    })
    const selectCount = params.selectCount || 1
    const [selectList, setSelectList] = useState([])
    const isDisabled = selectList.length != selectCount
    useEffect(() => {
        if (isRequestNft) {
            Toast.showLoading()
        } else {
            Toast.hideLoading()
        }
    }, [isRequestNft])
    return (
        <div className='page assets-trading'>
            <div className='flex ac jsb p16 border-b'>
                <div className='fz18 fw600'>{I18n.t('nft.selectHero')}</div>
                <Button
                    className='fz16 ph24'
                    disabled={isDisabled}
                    onClick={() => {
                        const infoList = []
                        filterNftList.forEach((e) => {
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
                    {I18n.t('nft.nftAdd')}
                </Button>
            </div>
            <div>
                <div className='fz18 pv8 ph16'>{I18n.t('nft.totalNum').replace('{num}', filterNftList.length)}</div>
                <div className='ph8'>
                    {filterNftList.map((e) => {
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
                                        if (newList.length >= selectCount) {
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
                                <SvgIcon name='select' className={isSelect ? 'cP' : 'cS'} size='20' />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
