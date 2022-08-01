import React from 'react'
import { Form, Input, Button } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useEditWallet } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import { Nav, Toast } from '@/common'

const schema = Yup.object().shape({
    old: Yup.string().required(),
    newPassword: Yup.string().required(),
    rePassword: Yup.string().required()
    // agree: Yup.bool().required()
})
export const UserWalletPassword = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const editWallet = useEditWallet()
    return (
        <div>
            <Nav title={I18n.t('user.resetPassword')} />
            <div>
                <Formik
                    initialValues={{}}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={schema}
                    onSubmit={(values) => {
                        if (params.password !== values.old) {
                            return Toast.error(I18n.t('user.passwordError'))
                        }
                        const { newPassword, rePassword } = values
                        if (!Base.checkPassword(newPassword)) {
                            return Toast.error(I18n.t('account.intoPasswordTips'))
                        }
                        if (newPassword !== rePassword) {
                            return Toast.error(I18n.t('account.checkPasswrod'))
                        }
                        editWallet(params.id, { password: values.newPassword }, true)
                        Toast.success(I18n.t('user.passwordSucc'))
                        Base.goBack()
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph16 pv32'>
                            <Form>
                                <Form.Item className={`mt8 pl0 ${errors.old && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('user.old')}</div>
                                    <Input
                                        className='pv4'
                                        type='password'
                                        placeholder={I18n.t('user.oldTips')}
                                        onChange={handleChange('old')}
                                        value={values.old}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                <Form.Item className={`mt32 pl0 ${errors.newPassword && 'form-error'}`}>
                                    <div className='fz16 mb16'>{I18n.t('user.new')}</div>
                                    <Input
                                        className='pv4'
                                        type='password'
                                        placeholder={I18n.t('user.newTips')}
                                        onChange={handleChange('newPassword')}
                                        value={values.newPassword}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.rePassword && 'form-error'}`}>
                                    <Input
                                        className='pv4'
                                        type='password'
                                        placeholder={I18n.t('user.repeatPassword')}
                                        onChange={handleChange('rePassword')}
                                        value={values.rePassword}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                {/* <Form.Item
								style={[SS.row, SS.as, SS.ml0, SS.mt20, { borderBottomWidth: 0 }]}
								onPress={() => {
									setFieldValue('agree', !values.agree);
								}}>
								<Image
									source={values.agree ? images.com.checkbox_1 : images.com.checkbox_0}
									style={[S.wh(15), SS.mr10, S.marginT(3)]}
								/>
								<div style={[S.w(ThemeVar.deviceWidth - 120)]}>
									<Text
										style={[
											S.tl,
											S.lineHeight(22),
											S.color(!errors.agree ? ThemeVar.textColor : ThemeVar.inputErrorBorderColor)
										]}>
										{I18n.t('user.exportNewFile')}
									</Text>
								</div>
							</Form.Item> */}
                                <div style={{ marginTop: 100 }}>
                                    <Button size='large' color='primary' block onClick={handleSubmit}>
                                        {I18n.t('user.resetPassword')}
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
