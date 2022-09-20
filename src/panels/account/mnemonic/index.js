import React, { useEffect, useState } from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Nav } from '@/common'

export const AccountMnemonic = () => {
    const [registerInfo, setRegisterInfo] = useStore('common.registerInfo')
    const [list, setList] = useState([])
    const [errList, setErrList] = useState([])
    useEffect(() => {
        const code = IotaSDK.getMnemonic()
        // console.log(code)
        setList(code.toString().split(' '))
        setErrList(IotaSDK.getMnemonic().toString().split(' '))
        setRegisterInfo({ ...registerInfo, mnemonic: code })
    }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('account.mnemonicTitle')} />
            <div className='page-content ph20 pb30 pt16' style={{ overflow: 'scroll' }}>
                <div className='mb10'>
                    <div className='fz16 tc'>{I18n.t('account.mnemonicSubTitle')}</div>
                </div>
                <div className='flex row border' style={{ borderRadius: 20, flexWrap: 'wrap' }}>
                    {list.map((e, i) => {
                        return (
                            <div
                                key={`${e}_${i}`}
                                className={`flex c pr ${i >= 3 && 'border-t'} ${i % 3 !== 2 && 'border-r'}`}
                                style={{ width: '33.33%', height: 45 }}>
                                <div className='pa fz16' style={{ left: 6, top: 4 }}>
                                    {i + 1}
                                </div>
                                <div className='fz18 tc'>{e}</div>
                            </div>
                        )
                    })}
                </div>
                {/* <div className='mb10 mt20 flex as row'>
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
                </div> */}
                <div className='mt20'>
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
