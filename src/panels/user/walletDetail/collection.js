import React, { useEffect, useState } from 'react'
import { AssetsNav, Nav, SvgIcon, Toast } from '@/common'
import { Button, Input, Mask } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useCollect, useGetWalletInfo, useGetNodeWallet } from '@tangle-pay/store/common'

const clientWidth = document.body.clientWidth
export const WalletCollection = () => {
    const [, totalInfo, loading, getInfo] = useGetWalletInfo()
    const [curWallet] = useGetNodeWallet()
    const [password, setPassword] = useState('')
    const [isShow, setShow] = useState(false)
    const [list, setList] = useState([])
    const [start, stop] = useCollect()
    let handeNum = list?.length || 0
    const totalNum = totalInfo?.outputIds?.length || 0
    handeNum = handeNum <= totalNum ? handeNum : totalNum
    const handleStop = async () => {
        stop()
        setShow(false)
        Toast.showLoading()
        await getInfo()
        Toast.hideLoading()
        Base.goBack()
    }
    useEffect(() => {
        if (handeNum >= totalNum) {
            handleStop()
        }
    }, [handeNum, totalNum])
    return (
        <>
            <div>
                <Nav title={curWallet.name} />
                <div className='page-content'>
                    <div className='border-b p16'>
                        <div className='border fz12 cS p8' style={{ borderRadius: 8, wordBreak: 'break-all' }}>
                            {curWallet.address}
                        </div>
                    </div>
                    <div className='ph16 pv24'>
                        <div className='flex c pb20'>
                            <div className='fz18'>{I18n.t('account.outputCollect')}</div>
                        </div>
                        <div className='flex ac mt10'>
                            <div className='fz14 cS mr24'>{I18n.t('account.pendingNum')}</div>
                            <div className='fz16 cP fw600'>{totalNum}</div>
                        </div>
                        <div className='fz14 mt24'>{I18n.t('assets.passwordTips')}</div>
                        <Input type='password' value={password} onChange={setPassword} className='border-b pv10' />
                        <Button
                            onClick={() => {
                                if (password !== curWallet.password) {
                                    return Toast.error(I18n.t('assets.passwordError'))
                                }
                                start(curWallet, setList)
                                setShow(true)
                            }}
                            className='mt40 mb16'
                            block
                            color='primary'>
                            {I18n.t('account.outputCollect')}
                        </Button>
                    </div>
                </div>
            </div>
            {isShow ? (
                <Mask
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    visible={isShow}
                    opacity={0.5}>
                    <div
                        className='bgW'
                        style={{
                            borderRadius: 16,
                            marginLeft: 8,
                            marginRight: 8,
                            width: clientWidth - 16
                        }}>
                        <div className='border-b ph16 pv15'>
                            <div className='fz16 fw600'>{I18n.t('account.outputCollect')}</div>
                        </div>
                        <div className='p16 flex ac jsb'>
                            <div className='fz16 cS'>{I18n.t('account.processedNum')}</div>
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
                                <div className='cP fw600 fz16'>
                                    {handeNum} / {totalNum}
                                </div>
                            </div>
                        </div>
                        <div className='p15'>
                            <Button block onClick={handleStop} color='primary'>
                                {I18n.t('account.collectTermination')}
                            </Button>
                        </div>
                    </div>
                </Mask>
            ) : null}
        </>
    )
}
