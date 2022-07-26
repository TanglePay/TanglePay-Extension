import React, { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Form, Input, Button } from 'antd-mobile'
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
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    const addWallet = useAddWallet()
    const changeNode = useChangeNode()
    return (
        <div>
            <Nav title={name} />
            <div>
                <div className='pv20 ph16'>
                    <div className='border radius8 p8'>
                        <div className='fz13 cS' style={{ lineHeight: '20px', wordBreak: 'break-all' }}>
                            {curEdit.address}
                        </div>
                    </div>
                </div>
                <div className='flex c'>
                    <div className='fz16 fw600'>Claim Shimmer Staking Rewards</div>
                </div>
                <Formik
                    innerRef={form}
                    initialValues={{}}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        await changeNode(101)
                        const { password } = values
                        if (!Base.checkPassword(password)) {
                            return Toast.error(I18n.t('account.intoPasswordTips'))
                        }
                        const seed = curEdit.seed
                        const res = await IotaSDK.importSMRBySeed(seed, password)
                        addWallet({
                            ...res
                        })
                        Base.replace('/assets/claimReward/claimResult', { id })
                    }}>
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <div className='ph16'>
                            <Form>
                                <Form.Item className={`mt5 mb20 pl0 border-b ${errors.password && 'form-error'}`}>
                                    <div className='fz14 mb10'>{I18n.t('account.intoPassword')}</div>
                                    <Input
                                        type='password'
                                        placeholder={I18n.t('account.intoPasswordTips')}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                        maxLength={20}
                                    />
                                </Form.Item>
                            </Form>
                            <div className='flex row ac jsb pt80'>
                                <Button
                                    onClick={handleSubmit}
                                    // style={{ height: 48 }}
                                    color='primary'
                                    block>
                                    Claim
                                </Button>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
        </div>
    )
}
