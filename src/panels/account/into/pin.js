import React, { useRef, useState, useEffect } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { useAddWallet } from '@tangle-pay/store/common'
import * as Yup from 'yup'
import { useCreateCheck } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import { Nav, SvgIcon, Toast } from '@/common'
import { context, setPin, shouldShowSetPin } from '@tangle-pay/domain'
import { useStore } from '@tangle-pay/store'
import './index.less'
import { ExpDialog } from './expDialog'

const schemaNopassword = Yup.object().shape({
    mnemonic: Yup.string().required(),
    name: Yup.string().required(),
    agree: Yup.bool().isTrue().required()
})
export const AccountIntoPin = () => {
    const dialogRef = useRef()
    const [_, setRegisterInfo] = useStore('common.registerInfo')
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const type = parseInt(params.type)
    const from = params.from
    const form = useRef()
    const [shouldShowPin, setShouldShowPin] = useState(true)
    useEffect(() => {
        console.log(context)
        setShouldShowPin(shouldShowSetPin())
    }, [])
    useCreateCheck((name) => {
        form.current.setFieldValue('name', name)
    })
    const addWallet = useAddWallet()
    return (
        <div className='page into-page'>
            <Nav title={I18n.t(type === 1 ? 'account.intoTitle1' : 'account.intoTitle2')} />
            <div className='page-content pb30'>
                <Formik
                    innerRef={form}
                    initialValues={{
                        agree: true
                    }}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={schemaNopassword}
                    onSubmit={async (values) => {
                        //import mnenomics
                        if (type === 1) {
                            const { password, rePassword } = values
                            if (shouldShowPin) {
                                if (!Base.checkPin(password)) {
                                    return Toast.error(I18n.t('account.intoPinTips'))
                                }
                                if (password !== rePassword) {
                                    return Toast.error(I18n.t('account.checkPin'))
                                }
                                await setPin(password)
                            } else {
                                values.password = context.state.pin
                                values.rePassword = context.state.pin
                            }

                            Toast.showLoading()

                            const checkList = await IotaSDK.importMnemonicCheckBalance({ ...values }, 5)
                            let hasBalanceList = checkList.filter((e) => e.balances.find((d) => Number(d.balance) > 0))
                            for (let i = 0; i < checkList.length; i++) {
                                const e = checkList[i]
                                checkList[i].hasImport = await IotaSDK.checkImport(e.address)
                            }
                            Toast.hideLoading()
                            const needImportList = hasBalanceList.filter((e) => !e.hasImport)
                            const jump = (res) => {
                                if (from === 'smr') {
                                    Base.replace('/assets/claimReward/claimSMR', {
                                        id: res.id
                                    })
                                } else {
                                    Base.replace('/main')
                                }
                            }
                            if (needImportList.length == 0) {
                                const res = await IotaSDK.importMnemonic({
                                    ...values
                                })
                                addWallet({
                                    ...res
                                })
                                jump(res)
                            } else if (needImportList.length == 1) {
                                const res = await IotaSDK.importMnemonic({
                                    ...values,
                                    path: needImportList[0].path
                                })
                                addWallet({
                                    ...res
                                })
                                jump(res)
                            } else {
                                setRegisterInfo({ ...values })
                                Base.push('/account/into/import', { list: JSON.stringify(hasBalanceList) })
                                return
                            }
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='p16 pt12 flex column jsb'>
                            <Form>
                                {type === 1 ? (
                                    <div>
                                        <div className='flex ac js'>
                                            <div className='fz16 cS'>{I18n.t('account.mnemonicTips')}</div>
                                            <SvgIcon
                                                onClick={() => {
                                                    dialogRef.current.show()
                                                }}
                                                name='help'
                                                className='cS ml8 press mt4'
                                                size='16'
                                                style={{ height: 23 }}
                                            />
                                        </div>
                                        <div className={`border radius10 mt12 flex c column ${!errors.mnemonic ? 'border-color-b' : 'border-color-r'}`}>
                                            <TextArea rows={4} className='p10' onChange={handleChange('mnemonic')} value={values.mnemonic} />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`border radius10 mt10 flex c column ${!errors.mnemonic ? 'border-color-b' : 'border-color-r'}`}
                                        style={{
                                            height: 140
                                        }}>
                                        <SvgIcon size={50} name='file' className='mb20' />
                                        <div>{I18n.t('account.intoSelectFile')}</div>
                                    </div>
                                )}
                                <Form.Item className={`mt10 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input style={{ paddingTop: 3, paddingBottom: 3 }} placeholder={I18n.t('account.intoNameTips')} onChange={handleChange('name')} value={values.name} />
                                </Form.Item>
                                {shouldShowPin && (
                                    <Form.Item className={`mt10 pl0 ${errors.password && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('account.intoPin')}</div>
                                        <Input className='pt4' type='password' placeholder={I18n.t('account.intoPinTips')} onChange={handleChange('password')} value={values.password} maxLength={20} />
                                    </Form.Item>
                                )}
                                {type === 1 && shouldShowPin && (
                                    <Form.Item className={`pl0 ${errors.rePassword && 'form-error'}`}>
                                        <Input
                                            type='password'
                                            className='pt4'
                                            placeholder={I18n.t('account.intoRePin')}
                                            onChange={handleChange('rePassword')}
                                            value={values.rePassword}
                                            maxLength={20}
                                        />
                                    </Form.Item>
                                )}
                            </Form>
                            <div
                                className='flex row as pl0 mt30 mb20'
                                onClick={() => {
                                    setFieldValue('agree', !values.agree)
                                }}>
                                <SvgIcon size={15} className={`mr8 fz20 ${values.agree ? 'cP' : 'cB'}`} name={values.agree ? 'checkbox_1' : 'checkbox_0'} />
                                <div className={`fz16 tl ${!errors.agree ? 'cB' : 'cR'}`} style={{ lineHeight: '22px' }}>
                                    {I18n.t('account.intoAgree')
                                        .split('##')
                                        .filter((e) => !!e)
                                        .map((e, i) => {
                                            return i % 2 ? (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        Base.push(i === 1 ? 'https://tanglepay.com/terms.html' : 'https://tanglepay.com/policy.html')
                                                    }}
                                                    key={i}
                                                    className='cP press'>
                                                    {e}
                                                </span>
                                            ) : (
                                                <span key={i}>{e}</span>
                                            )
                                        })}
                                </div>
                            </div>
                            <Button style={{ height: 40 }} color='primary' block onClick={handleSubmit}>
                                {I18n.t('account.intoBtn')}
                            </Button>
                        </div>
                    )}
                </Formik>
            </div>
            <ExpDialog dialogRef={dialogRef} />
        </div>
    )
}
