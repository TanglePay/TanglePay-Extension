import React from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from 'antd-mobile'
import { useRemoveWallet, useGetNodeWallet } from '@tangle-pay/store/common'
import { Base, I18n } from '@tangle-pay/common'
import { Nav } from '@/common'

export const RemoveWallet = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    const removeWallet = useRemoveWallet()
    return (
        <div>
            <Nav title={name} />
            <div>
                <div className='pv20 ph15'>
                    <div className='border radius10 p10'>
                        <div className='fz13 cS' style={{ lineHeight: '20px', wordBreak: 'break-all' }}>
                            {curEdit.address}
                        </div>
                    </div>
                </div>
                <div className='flex c pb20'>
                    <div className='fz16 fw600'>{I18n.t('account.removeTitle')}</div>
                </div>
                <div className='radius10 mh15 p10 mb10' style={{ backgroundColor: 'rgba(213, 53, 84, 0.05)' }}>
                    <div className='fz14' style={{ color: '#D53554', lineHeight: '20px' }}>
                        {I18n.t('account.removeTips')}
                    </div>
                </div>
                <div className='flex row ac jsb ph15 mt30'>
                    <Button
                        onClick={() => {
                            removeWallet(id)
                            Base.goBack()
                            Base.goBack()
                        }}
                        className='flex1 radius10'
                        style={{ height: 44, background: '#D53554', borderColor: '#D53554' }}
                        color='danger'
                        block>
                        {I18n.t('account.remove')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
