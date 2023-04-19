import React, { useEffect, useState } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Form, Input, Button, Dialog } from 'antd-mobile'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useLocation } from 'react-router-dom'
import { useGetNodeWallet, useGetAssetsList } from '@tangle-pay/store/common'
import { Nav, Toast } from '@/common'

const schema = {
    // amount: Yup.number().positive().required(),
    password: Yup.string().required()
}
export const StakingAdd = () => {
    const [assetsList] = useStore('common.assetsList')
    const [currency] = useState('IOTA')
    const [curWallet] = useGetNodeWallet()
    useGetAssetsList(curWallet)
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let { tokens, type } = params
    type = parseInt(type)
    tokens = JSON.parse(tokens)
    const assets = assetsList.find((e) => e.name === currency) || {}
    let available = parseFloat(assets.balance) || 0
    const realBalance = assets.realBalance
    let titleKey = ''
    // 4-》add airdrop
    if ([4].includes(type)) {
        titleKey = 'staking.addAirdropTitle'
    } else if ([1, 2].includes(type)) {
        // 1-》stake  2-》add amount
        titleKey = 'staking.stake'
    } else {
        // 3-》unstake
        titleKey = 'staking.unstake'
    }
    const isLedger = curWallet.type == 'ledger'
    if (isLedger) {
        schema.password = Yup.string().optional()
    } else {
        schema.password = Yup.string().required()
    }
    useEffect(() => {
        !available ? Toast.showLoading() : Toast.hideLoading()
    }, [available])
    return (
        <div className='h100'>
            <Nav title={I18n.t(titleKey).replace(/\{name\}/, tokens.map((e) => e.token).join(' , '))} />
            <div className='page-content'>
                <Formik
                    initialValues={{}}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={Yup.object().shape(schema)}
                    onSubmit={async (values) => {
                        const { password } = values
                        try {
                            if (!isLedger) {
                                const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
                                if (!isPassword) {
                                    return Toast.error(I18n.t('assets.passwordError'))
                                }
                            }
                            if (available <= 0) {
                                return Toast.error(I18n.t('assets.balanceError'))
                            }
                            const request = async (requestTokens) => {
                                Toast.showLoading()
                                const res = await IotaSDK.handleStake({
                                    wallet: { ...curWallet, password },
                                    tokens: requestTokens,
                                    amount: realBalance,
                                    type
                                })
                                Toast.hideLoading()
                                if (res.code === 0) {
                                    if (isLedger) {
                                        Base.replace('/main')
                                    } else {
                                        Base.goBack()
                                    }
                                } else {
                                    Toast.error(res.msg)
                                }
                            }
                            const limitTokens = tokens.filter((e) => e.limit && e.limit > available)
                            if (type === 1 && limitTokens.length > 0) {
                                limitTokens.sort((a, b) => a.limit - b.limit)
                                const tips = I18n.t('staking.limitAmount').replace('{num}', limitTokens[0].limit).replace('{token}', limitTokens[0].token)

                                Dialog.alert({
                                    content: tips,
                                    confirmText: I18n.t('staking.confirm'),
                                    onConfirm() {
                                        const requestTokens = tokens.filter((e) => !e.limit || e.limit <= available)
                                        if (requestTokens.length > 0) {
                                            setTimeout(() => {
                                                request(requestTokens)
                                            }, 600)
                                        } else {
                                            Base.goBack()
                                        }
                                    }
                                })
                            } else {
                                request(tokens)
                            }
                        } catch (error) {
                            console.log(error)
                            Toast.show(String(error))
                        }
                    }}>
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <div className='ph16 pv24'>
                            <Form>
                                {!isLedger ? (
                                    <>
                                        <div className='fz16 mb10'>{I18n.t('assets.password')}</div>
                                        <Form.Item className={`mt5 pl0 ${errors.password && 'form-error'}`}>
                                            <Input type='password' className='pl0' placeholder={I18n.t('assets.passwordTips')} onChange={handleChange('password')} value={values.password} />
                                        </Form.Item>
                                    </>
                                ) : null}
                                <div className='mt40 pb30'>
                                    <Button color='primary' size='large' block onClick={handleSubmit}>
                                        {I18n.t('assets.confirm')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Formik>
            </div>
        </div>
    )
}
