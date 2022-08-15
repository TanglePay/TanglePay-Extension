import React from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from 'antd-mobile'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { Base, I18n } from '@tangle-pay/common'
import { Nav } from '@/common'

export const ClaimResult = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const amount = params.amount
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    return (
        <div>
            <Nav title={name} />
            <div className='p16'>
                <div className='fz18 fw600 pb16'>{I18n.t('shimmer.smrClaimStakingReward')}</div>
                <div className='fz18 pb16 fw600'>
                    {I18n.t('shimmer.smrAmount')}
                    <span className='cP'>{amount}</span>
                </div>
                <div className='fz18 pb16'>
                    {I18n.t('shimmer.createTips')
                        .replace('{name}', name)
                        .replace('{address}', Base.handleAddress(curEdit.address))
                        .split('##')
                        .filter((e) => !!e)
                        .map((e, i) => {
                            return (
                                <span className={i === 1 ? 'fw600' : ''} key={i}>
                                    {e}
                                </span>
                            )
                        })}
                </div>
                <div className='fz18 mb16'>{I18n.t('shimmer.createSuccTips')}</div>
                <div className='flex row ac jsb' style={{ marginTop: 100 }}>
                    <Button
                        onClick={() => {
                            Base.replace('/main')
                        }}
                        className='flex1 radius8'
                        color='primary'
                        block>
                        {I18n.t('shimmer.understand')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
