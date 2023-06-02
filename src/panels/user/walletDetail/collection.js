import React, { useEffect, useState } from 'react'
import { AssetsNav, Nav, SvgIcon, Toast } from '@/common'
import { Button, Input, Mask } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useCollect, useGetWalletInfo, useGetNodeWallet } from '@tangle-pay/store/common'
import { context, checkWalletIsPasswordEnabled } from '@tangle-pay/domain'

export const WalletCollection = () => {
    const [, totalInfo, loading, getInfo] = useGetWalletInfo()
    const [curWallet] = useGetNodeWallet()
    const [contentW, setContentW] = useState(375)
    const [password, setPassword] = useState('')
    const [isWalletPassowrdEnabled, setIsWalletPassowrdEnabled] = useState(false)
    const isLedger = curWallet.type == 'ledger'
    useEffect(() => {
        checkWalletIsPasswordEnabled(curWallet.id).then((res) => {
            setIsWalletPassowrdEnabled(res)
        })
    })
    const [isShow, setShow] = useState(false)
    const [list, setList] = useState([])
    const [start, stop] = useCollect()
    let handeNum = list?.length || 0
    const totalNum = totalInfo?.outputIds?.length || 0
    handeNum = handeNum <= totalNum ? handeNum : totalNum
    const handleStop = () => {
        Base.globalTemData.toastStr = I18n.t('account.collectSuccTips')
        stop()
        setShow(false)
        if (isLedger) {
            Base.replace('/main')
        } else {
            Base.goBack()
        }
        getInfo()
        setTimeout(() => {
            getInfo()
        }, 3000)
    }
    useEffect(() => {
        if (handeNum >= totalNum && handeNum > 0) {
            handleStop()
        }
    }, [handeNum, totalNum])
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
    return (
        <>
            <div>
                <Nav title={curWallet.name} />
                <div className='page-content'>
                    <div className='p16'>
                        <div className='border fz16 cS p8' style={{ borderRadius: 8, wordBreak: 'break-all' }}>
                            {curWallet.address}
                        </div>
                    </div>
                    <div className='ph16 pt16'>
                        <div className='flex ac pb10'>
                            <div className='fz18'>{I18n.t('account.outputCollect')}</div>
                        </div>
                        <div className='flex ac mt10'>
                            <div className='fz16 cS mr24'>{I18n.t('account.pendingNum')}</div>
                            <div className='fz18 cP fw600'>{totalNum}</div>
                        </div>
                        {isWalletPassowrdEnabled && !isLedger ? (
                            <>
                                <div className='fz16 mt24'>{I18n.t('assets.passwordTips')}</div>
                                <Input type='password' value={password} onChange={setPassword} className='border-b pv10' />
                            </>
                        ) : null}
                        <Button
                            onClick={async () => {
                                let walletPassword = password
                                if (!isWalletPassowrdEnabled) {
                                    walletPassword = context.state.pin
                                }
                                if (!isLedger) {
                                    const isPassword = await IotaSDK.checkPassword(curWallet.seed, walletPassword)
                                    if (!isPassword) {
                                        return Toast.error(I18n.t('assets.passwordError'))
                                    }
                                }
                                start({ ...curWallet, password: walletPassword }, setList)
                                setShow(true)
                            }}
                            disabled={!password && isWalletPassowrdEnabled && !isLedger}
                            className='mt40 mb16'
                            block
                            color='primary'>
                            {I18n.t('account.outputCollect')}
                        </Button>
                    </div>
                </div>
            </div>
            {isShow ? (
                <Mask style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} visible={isShow} opacity={0.5}>
                    <div
                        className='bgW'
                        style={{
                            borderRadius: 16,
                            marginLeft: 16,
                            marginRight: 16,
                            width: contentW - 32
                        }}>
                        <div className='border-b ph16 pv12'>
                            <div className='fz18 fw600'>{I18n.t('account.outputCollect')}</div>
                        </div>
                        <div className='p16 flex ac jsb'>
                            <div className='fz18 cS'>{I18n.t('account.processedNum')}</div>
                            <div className='flex ac'>
                                {handeNum < totalNum ? (
                                    <SvgIcon
                                        style={{
                                            transform: ['scale(0.3)'],
                                            height: 30,
                                            width: 30,
                                            transformOrigin: 'left top'
                                        }}
                                        className='ml5'
                                        name='loading'
                                    />
                                ) : null}
                                <div className='cP fw600 fz18'>
                                    {handeNum} / {totalNum}
                                </div>
                            </div>
                        </div>
                        <div className='p15'>
                            <Button block onClick={handleStop} color='primary' style={{ height: 48 }}>
                                {I18n.t('account.collectTermination')}
                            </Button>
                        </div>
                    </div>
                </Mask>
            ) : null}
        </>
    )
}
