import React, { useEffect, useState } from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Nav, SvgIcon, Toast } from '@/common'
import { useAddWallet } from '@tangle-pay/store/common'
import { markWalletPasswordEnabled } from '@tangle-pay/domain';

export const AccountMnemonic = () => {
    const [registerInfo, setRegisterInfo] = useStore('common.registerInfo')
    const [list, setList] = useState([])
    const [agree, setAgree] = useState(false)
    const [error, setError] = useState(false)
    const [errList, setErrList] = useState([])
    const addWallet = useAddWallet()
    useEffect(() => {
        const code = IotaSDK.getMnemonic()
        setList(code.toString().split(' '))
        setErrList(IotaSDK.getMnemonic().toString().split(' '))
        setRegisterInfo({ ...registerInfo, mnemonic: code })
    }, [])
    useEffect(() => {
        if (agree) {
            setError(false)
        }
    }, [agree])
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
                                style={{ width: '33.33%', height: 35 }}>
                                {i < 4 ? (
                                    <div className='pa fz16 cP' style={{ left: 6, top: 4 }}>
                                        {i + 1}
                                    </div>
                                ) : null}
                                <div className='fz18 fw600 tc'>{e}</div>
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
                <div
                    className='flex row as pl0 mt20 mb10'
                    onClick={() => {
                        setAgree(!agree)
                    }}>
                    <SvgIcon
                        size={15}
                        className={`mr8 fz20 ${agree ? 'cP' : 'cB'}`}
                        name={agree ? 'checkbox_1' : 'checkbox_0'}
                    />
                    <div className={`fz16 tl ${error ? 'cR' : 'cB'}`} style={{ lineHeight: '22px' }}>
                        {I18n.t('account.mnemonicAggre')}
                    </div>
                </div>
                <div>
                    <Button
                        size='large'
                        color='primary'
                        block
                        onClick={() => {
                            if (!agree) {
                                return setError(true)
                            }
                            Base.push('/account/verifyMnemonic', { list, errList })
                        }}>
                        {I18n.t('account.mnemonicBtn')}
                    </Button>
                    <Button
                        size='large'
                        fill='outline'
                        color='primary'
                        className='mt10'
                        block
                        onClick={async () => {
                            if (!agree) {
                                return setError(true)
                            }
                            Toast.showLoading()
                            const res = await IotaSDK.importMnemonic(registerInfo)
                            if (registerInfo.passwordIsPassword) {
								await markWalletPasswordEnabled(res.id);
							}
                            addWallet(res)
                            setRegisterInfo({})
                            Toast.hideLoading()
                            Base.replace('/main')
                        }}>
                        {I18n.t('account.gotoWallet')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
