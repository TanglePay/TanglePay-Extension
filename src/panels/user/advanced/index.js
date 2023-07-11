import React, { useEffect, useState } from 'react'
import { I18n, Base, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Nav, SvgIcon, Toast } from '@/common'
import { Switch } from 'antd-mobile'
import { useChangeNode } from '@tangle-pay/store/common'

export const UserAdvanced = () => {
    const changeNode = useChangeNode()
    const [_, changeWalletList] = useStore('common.walletsList')
    const [shimmerSupport, setShimmerSupport] = useState(false)
    const [iotaSupport, setIotaSupport] = useState(false)
    const [polyganSupport, setPolyganSupport] = useState(false)
    const dispatch = (key, data) => {
        if (Base.globalDispatch) {
            Base.globalDispatch({
                type: key,
                data
            })
        }
    }
    useEffect(() => {
        Base.getLocalData('common.shimmerSupport').then((res) => {
            setShimmerSupport(res == 1)
        })
        Base.getLocalData('common.iotaSupport').then((res) => {
            setIotaSupport(res == 1)
        })
        Base.getLocalData('common.polyganSupport').then((res) => {
            setPolyganSupport(res == 1)
        })
    }, [])
    const handleChange = async () => {
        await IotaSDK.getNodes()
        const newWalletList = await IotaSDK.getWalletList()
        const curNodeId = await Base.getLocalData('common.curNodeId')
        if (!curNodeId) {
            changeNode(IotaSDK.IOTA_NODE_ID)
        }
        changeWalletList(newWalletList)
    }
    return (
        <div className='page'>
            <Nav title='Advanced' />
            <div>
                <div className='flex row ac jsb p16 border-b'>
                    <div className='fz18'>Support Shimmer Testnet</div>
                    <Switch
                        checked={shimmerSupport}
                        onChange={async (e) => {
                            setShimmerSupport(e)
                            Base.setLocalData('common.shimmerSupport', e ? 1 : 0)
                            dispatch('common.shimmerSupport', e ? 1 : 0)
                            await handleChange()
                        }}
                    />
                </div>
                <div className='flex row ac jsb p16 border-b'>
                    <div className='fz18'>Support IOTA Testnet</div>
                    <Switch
                        checked={iotaSupport}
                        onChange={async (e) => {
                            setIotaSupport(e)
                            Base.setLocalData('common.iotaSupport', e ? 1 : 0)
                            dispatch('common.iotaSupport', e ? 1 : 0)
                            await handleChange()
                        }}
                    />
                </div>
                <div className='flex row ac jsb p16 border-b'>
                    <div className='fz18'>Support Polygon Testnet</div>
                    <Switch
                        checked={polyganSupport}
                        onChange={async (e) => {
                            setPolyganSupport(e)
                            Base.setLocalData('common.polyganSupport', e ? 1 : 0)
                            dispatch('common.polyganSupport', e ? 1 : 0)
                            await handleChange()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
