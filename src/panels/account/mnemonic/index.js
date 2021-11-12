import React, { useEffect, useState } from 'react'
import { Button } from 'antd-mobile'
import { Base, Nav, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'

export const AccountMnemonic = () => {
    const [registerInfo, setRegisterInfo] = useStore('common.registerInfo')
    const [list, setList] = useState([])
    const [errList, setErrList] = useState([])
    useEffect(() => {
        const code = IotaSDK.getMnemonic()
        setList(code.toString().split(' '))
        setErrList(IotaSDK.getMnemonic().toString().split(' '))
        console.log(code)
        setRegisterInfo({ ...registerInfo, mnemonic: code })
    }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('account.mnemonicTitle')} />
            <div className='page-content ph50 pb30'>
                <div className='mb10'>
                    <div className='cS fz14'>{I18n.t('account.mnemonicSubTitle')}</div>
                </div>
                <div className='flex row border' style={{ borderRadius: 20, flexWrap: 'wrap' }}>
                    {list.map((e, i) => {
                        return (
                            <div
                                key={`${e}_${i}`}
                                className={`p5 ${i >= 3 && 'border-t'} ${i % 3 !== 2 && 'border-r'}`}
                                style={{ width: '33.33%' }}>
                                <div className='fz13 cS'>{i + 1}</div>
                                <div className='fz15 tc'>{e}</div>
                            </div>
                        )
                    })}
                </div>
                <div className='mb10 mt20 flex as row'>
                    <div className='mr20 mt5' style={{ fontSize: 6 }}>
                        ●
                    </div>
                    <div className='fz14 cS'>{I18n.t('account.mnemonicPhraseTips1')}</div>
                </div>
                <div className='mb10 flex as row'>
                    <div className='mr20 mt5' style={{ fontSize: 6 }}>
                        ●
                    </div>
                    <div className='fz14 cS'>{I18n.t('account.mnemonicPhraseTips2')}</div>
                </div>
                <div className='mt15'>
                    <Button
                        size='large'
                        color='primary'
                        block
                        onClick={() => {
                            Base.push('/account/verifyMnemonic', { list, errList })
                        }}>
                        {I18n.t('account.mnemonicBtn')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
