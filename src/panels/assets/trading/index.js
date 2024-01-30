import React, { useState, useRef, useEffect } from 'react'
import { Nav, SvgIcon, Toast } from '@/common'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Form, Input, Button } from 'antd-mobile'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useGetAssetsList, useGetNodeWallet, useHandleUnlocalConditions } from '@tangle-pay/store/common'
import { useGetNftList } from '@tangle-pay/store/nft'
import { useLocation } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { context, checkWalletIsPasswordEnabled } from '@tangle-pay/domain'

// const schema = Yup.object().shape({
//     password: Yup.string().required()
// })
const schema = Yup.object().shape({
    password: Yup.string().required()
})
const schemaNopassword = Yup.object().shape({})
export const AssetsTrading = () => {
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [unlockConditions] = useStore('common.unlockConditions')
    const [nftUnlockList] = useStore('nft.unlockList')
    useGetNftList()
    useGetAssetsList(curWallet)
    const [isWalletPasswordEnabled, setIsWalletPasswordEnabled] = useState(false)
    useEffect(() => {
        checkWalletIsPasswordEnabled(curWallet.id).then((res) => {
            setIsWalletPasswordEnabled(res)
        })
    }, [])
    const { onDismiss, onDismissNft, onAccept, onAcceptNft } = useHandleUnlocalConditions()
    let curInfo = unlockConditions.find((e) => e.blockId == id)
    if (!curInfo) {
        curInfo = nftUnlockList.find((e) => e.nftId == id) || {}
    }
    const isLedger = params.isLedger == 1
    useEffect(() => {
        curInfo ? Toast.hideLoading() : Toast.showLoading()
    }, curInfo)
    return (
        <div className='page assets-trading'>
            <Nav title={I18n.t('assets.tradingTitle')} />
            <div className='ph16 pt16'>
                <div className='fz18 mb20 fw600'>{I18n.t('assets.acceptTitle')}</div>
                <div className='flex ac border-b pb20'>
                    <div className='flex c pr'>
                        <img
                            className='border pa bgW'
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 32,
                                left: 0,
                                opacity: 1,
                                top: 0,
                                zIndex: 0
                            }}
                            src={curInfo.logoUrl || curInfo.thumbnailImage || curInfo.media}
                            alt=''
                            onError={(e) => {
                                e.target.style.opacity = 0
                            }}
                        />
                        <div className='border bgP flex c cW fw600 fz24' style={{ width: 32, height: 32, borderRadius: 32 }}>
                            {String(curInfo.token || curInfo.name || '').toLocaleUpperCase()[0]}
                        </div>
                    </div>
                    <div className='cP fz16 fw600 ml20 mr24 ellipsis' style={{ width: 100 }}>
                        {curInfo.nftId ? curInfo.name : `${curInfo.token}: ${curInfo.amountStr}`}
                    </div>
                    <div className='fz16 fw400 ellipsis'>
                        {I18n.t('assets.tradingFrom')} {Base.handleAddress(curInfo.unlockAddress)}
                    </div>
                </div>
                {curInfo.standard || curInfo.depositStr ? (
                    <div className='pt16'>
                        {curInfo.depositStr ? (
                            <div className='flex ac jsb pb10'>
                                <div className='fz16 fw400'>{I18n.t('assets.storageDeposit')}</div>
                                <div className='fz16 fw400'>{curInfo.depositStr}</div>
                            </div>
                        ) : null}
                        <div className='flex ac jsb pb10'>
                            <div className='fz16 fw400'>{curInfo.token}</div>
                        </div>
                        {curInfo.standard ? (
                            <div className='flex ac jsb pb10'>
                                <div className='fz16 fw400'>{I18n.t('assets.standard')}</div>
                                <div className='fz16 fw400'>{curInfo.standard}</div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
                {curInfo.assetsId ? (
                    <div className='pt10'>
                        <div className='pb10'>
                            <div className='fz16 fw400'>{I18n.t('assets.tokenID')}</div>
                        </div>
                        <div className='pb10'>
                            <CopyToClipboard text={curInfo.assetsId} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                <div className='fz16 fw400 press' style={{ wordBreak: 'break-all' }}>
                                    {curInfo.assetsId}
                                </div>
                            </CopyToClipboard>
                        </div>
                    </div>
                ) : null}
                <div className='mt10'>
                    <Formik
                        innerRef={form}
                        initialValues={{}}
                        validateOnBlur={false}
                        validateOnChange={false}
                        validateOnMount={false}
                        validationSchema={(isLedger || !isWalletPasswordEnabled) ? schemaNopassword : schema}
                        onSubmit={async (values) => {
                            let { password } = values
                            if (!isWalletPasswordEnabled) {
                                password = context.state.pin
                            }
                            if (!isLedger) {
                                const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
                                if (!isPassword) {
                                    return Toast.error(I18n.t('assets.passwordError'))
                                }
                            }
                            try {
                                Toast.showLoading()
                                const info = {
                                    ...curInfo,
                                    curWallet: { ...curWallet, password }
                                }
                                if (info.nftId) {
                                    await onAcceptNft({
                                        ...curInfo,
                                        curWallet: { ...curWallet, password }
                                    })
                                } else {
                                    await onAccept({
                                        ...curInfo,
                                        curWallet: { ...curWallet, password }
                                    })
                                }
                                // if (curInfo.nftId) {
                                //     onDismissNft(curInfo.nftId)
                                // } else {
                                //     onDismiss(curInfo.blockId)
                                // }
                                Toast.hideLoading()
                                Toast.show(I18n.t('assets.acceptSucc'))
                                IotaSDK.refreshAssets()
                                setTimeout(() => {
                                    IotaSDK.refreshAssets()
                                }, 3000)
                                if (isLedger) {
                                    Base.replace('/main')
                                } else {
                                    Base.goBack()
                                }
                            } catch (error) {
                                Toast.hideLoading()
                                error = String(error)
                                if (error.includes('There are not enough funds in the inputs for the required balance')) {
                                    error = I18n.t('assets.unlockError')
                                    error = error.replace(/{token}/g, IotaSDK.isIotaStardust(curWallet.nodeId) ? 'IOTA' : 'SMR')
                                }
                                Toast.show(error)
                                Base.goBack()
                            }
                        }}>
                        {({ handleChange, handleSubmit, values, errors }) => (
                            <div>
                                {isWalletPasswordEnabled && !isLedger ? (
                                    <Form>
                                        <Form.Item className={`mb16 pl0 border-b ${errors.password && 'form-error'}`}>
                                            <div className='fz16 mb16'>{I18n.t('account.showKeyInputPassword').replace(/{name}/, curWallet.name)}</div>
                                            <Input
                                                className='fz16'
                                                type='password'
                                                placeholder={I18n.t('account.intoPasswordTips')}
                                                onChange={handleChange('password')}
                                                value={values.password}
                                                maxLength={20}
                                            />
                                        </Form.Item>
                                    </Form>
                                ) : null}
                                <div className='flex row ac jsb' style={{ marginTop: 50 }}>
                                    <Button onClick={handleSubmit} disabled={!values.password && isWalletPasswordEnabled && !isLedger} color='primary' block>
                                        {I18n.t('shimmer.accept')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    )
}
