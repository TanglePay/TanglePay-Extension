import React, { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Form, Input, Button, Mask } from 'antd-mobile'
import { useGetNodeWallet, useChangeNode } from '@tangle-pay/store/common'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Nav, Toast } from '@/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useAddWallet } from '@tangle-pay/store/common'

const schema = Yup.object().shape({
    password: Yup.string().required()
})
export const ClaimSMR = () => {
    const form = useRef()
    const [isShow, setShow] = useState(false)
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    const addWallet = useAddWallet()
    const changeNode = useChangeNode()
    const [contentW, setContentW] = useState(375)
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
    return (
        <div>
            <Nav title={name} />
            <div>
                <div className='pv16 ph16'>
                    <div className='border radius8 p8'>
                        <div className='fz16 cS' style={{ lineHeight: '20px', wordBreak: 'break-all' }}>
                            {curEdit.address}
                        </div>
                    </div>
                </div>
                <div className='flex c pt8 pb16'>
                    <div className='fz18 fw600'>Claim Shimmer Staking Rewards</div>
                </div>
                <Formik
                    innerRef={form}
                    initialValues={{}}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        setShow(true)
                        // await changeNode(IotaSDK.SMR_NODE_ID)
                        // const { password } = values
                        // if (!Base.checkPassword(password)) {
                        //     return Toast.error(I18n.t('account.intoPasswordTips'))
                        // }
                        // const res = await IotaSDK.claimSMR({ ...curEdit, password })
                        // console.log(res, '-------------------------')
                        // const seed = curEdit.seed
                        // const res = await IotaSDK.importSMRBySeed(seed, password)
                        // addWallet({
                        //     ...res
                        // })
                        // IotaSDK.claimSMR(curEdit, res.address)

                        // const sendRes = await IotaSDK.send(curEdit.address, res.address, sendAmount, {
                        //     contract: assets?.contract,
                        //     token: assets?.name
                        // })
                        // if (res) {
                        //     Toast.hideLoading()
                        //     Toast.success(
                        //         I18n.t(
                        //             IotaSDK.checkWeb3Node(curWallet.nodeId)
                        //                 ? 'assets.sendSucc'
                        //                 : 'assets.sendSuccRestake'
                        //         )
                        //     )
                        //     Base.goBack()
                        // }

                        // Base.replace('/assets/claimReward/claimResult', { id })
                    }}>
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <div className='ph16'>
                            <Form>
                                <Form.Item className={`mb16 pl0 border-b ${errors.password && 'form-error'}`}>
                                    <div className='fz16 mb16'>{I18n.t('account.intoPassword')}</div>
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
                            <div className='flex row ac jsb' style={{ marginTop: 100 }}>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!values.password}
                                    style={{ height: 48 }}
                                    color='primary'
                                    block>
                                    Claim
                                </Button>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
            <Mask opacity={0.3} onMaskClick={() => setShow(false)} visible={isShow}>
                <div style={{ width: contentW - 60 }} className='radius10 bgW pa-c'>
                    <div className='pv12 ph16 fz18 fw600 border-b'>Claiming Failed </div>
                    <div className='p16 fz16'>
                        您的IOTA钱包{' '}
                        <span className='fw600'>
                            {curEdit.name} {Base.handleAddress(curEdit.address)}
                        </span>{' '}
                        中没有可以Claim的Shimmer Staking Rewards
                    </div>
                    <div className='ph16 pb16'>
                        <Button
                            onClick={() => {
                                setShow(false)
                            }}
                            style={{ height: 48 }}
                            color='primary'
                            block>
                            I Understand
                        </Button>
                    </div>
                </div>
            </Mask>
        </div>
    )
}
