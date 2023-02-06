import React, { useState, useRef } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { Form, Input, Button } from 'antd-mobile'
import * as Yup from 'yup'
import { Nav, SvgIcon, Toast } from '@/common'

const schema = Yup.object().shape({
    contract: Yup.string().required(),
    symbol: Yup.string().required(),
    decimal: Yup.string().required()
})
export const ImportToken = () => {
    const form = useRef()
    const [curTab, setTab] = useState(0)
    const [searchStr, setSearch] = useState('')
    return (
        <div className='page'>
            <Nav title={I18n.t('assets.importToken')} />
            <div className='page-contetn'>
                <div className='ph16'>
                    <div className='flex row ac border-b'>
                        <div onClick={() => setTab(0)} className='flex c mr12 press' style={{ height: 50 }}>
                            <div className={`${curTab === 0 ? 'cP' : 'cB'} fw600 fz18`}>{I18n.t('assets.search')}</div>
                        </div>
                        <div onClick={() => setTab(1)} className='flex c mr12 press' style={{ height: 50 }}>
                            <div className={`${curTab === 1 ? 'cP' : 'cB'} fw600 fz18`}>
                                {I18n.t('assets.customTokens')}
                            </div>
                        </div>
                    </div>
                </div>
                {curTab == 0 ? (
                    <div className='mt16'>
                        <div style={{ height: 48, padding: 6 }} className='mh16 flex row ac bgS pl8 radius10'>
                            <SvgIcon name='search' color='#6C737C' size='16' />
                            <Input
                                className='ml4 mb4 fw400 fz18'
                                id='input'
                                value={searchStr}
                                onChange={setSearch}
                                placeholder='Search Tokens'
                                style={{
                                    '--placeholder-color': '#6C737C',
                                    '--font-size': '16px'
                                }}
                            />
                        </div>
                        <div className='flex ac jsb ph16' style={{ marginTop: 56 }}>
                            <Button
                                className='mr24'
                                size='middle'
                                fill='outline'
                                color='primary'
                                block
                                onClick={() => {
                                    Base.goBack()
                                }}>
                                {I18n.t('apps.cancel')}
                            </Button>
                            <Button
                                size='middle'
                                color='primary'
                                block
                                onClick={async () => {
                                    if (searchStr) {
                                        try {
                                            const web3Contract = IotaSDK.getContract(searchStr)
                                            console.log(web3Contract)
                                            if (web3Contract) {
                                                Toast.showLoading()
                                                const symbol = await web3Contract.methods.symbol().call()
                                                const decimal = await web3Contract.methods.decimals().call()
                                                Toast.hideLoading()
                                                console.log(symbol, decimal)
                                                IotaSDK.importContract(searchStr, symbol, decimal)
                                                Base.goBack()
                                                IotaSDK.refreshAssets()
                                            } else {
                                                Toast.hideLoading()
                                                Toast.show(I18n.t('assets.inputRightContract'))
                                            }
                                        } catch (error) {
                                            Toast.hideLoading()
                                            Toast.show(I18n.t('assets.inputRightContract'))
                                        }
                                    }
                                }}>
                                {I18n.t('assets.importBtn')}
                            </Button>
                        </div>
                    </div>
                ) : null}
                {curTab == 1 ? (
                    <Formik
                        innerRef={form}
                        initialValues={{}}
                        validateOnBlur={false}
                        validateOnChange={false}
                        validateOnMount={false}
                        validationSchema={schema}
                        onSubmit={async (values) => {
                            const { contract, symbol, decimal } = values
                            try {
                                const web3Contract = IotaSDK.getContract(contract)
                                if (web3Contract) {
                                    IotaSDK.importContract(contract, symbol, decimal)
                                    Base.goBack()
                                    IotaSDK.refreshAssets()
                                } else {
                                    Toast.show(I18n.t('assets.inputRightContract'))
                                }
                            } catch (error) {
                                Toast.show(error.toString())
                            }
                        }}>
                        {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                            <div className='ph16 pt8'>
                                <Form>
                                    <Form.Item className={`pl0 ${errors.contract && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('assets.tokenContractAddress')}</div>
                                        <Input
                                            className='pt4'
                                            placeholder={I18n.t('assets.inputContractAddress')}
                                            onChange={handleChange('contract')}
                                            value={values.contract}
                                        />
                                    </Form.Item>
                                    <Form.Item className={`pl0 ${errors.symbol && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('assets.tokenSymbol')}</div>
                                        <Input
                                            className='pt4'
                                            placeholder={I18n.t('assets.inputTokenSymbol')}
                                            onChange={handleChange('symbol')}
                                            value={values.symbol}
                                            maxLength={20}
                                        />
                                    </Form.Item>
                                    <Form.Item className={`pl0 ${errors.decimal && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('assets.tokenDecimal')}</div>
                                        <Input
                                            className='pt4'
                                            placeholder={I18n.t('assets.inputTokenDecimal')}
                                            onChange={handleChange('decimal')}
                                            value={values.decimal}
                                        />
                                    </Form.Item>
                                    <div style={{ marginTop: 100 }}>
                                        <Button size='large' color='primary' block onClick={handleSubmit}>
                                            {I18n.t('assets.confirm')}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </Formik>
                ) : null}
            </div>
        </div>
    )
}
