import React, { useState, useImperativeHandle, useEffect, useRef } from 'react';
import { Button, Mask, Form, Input } from 'antd-mobile';
import { I18n, Base, IotaSDK } from '@tangle-pay/common';
import { useEditWallet } from '@tangle-pay/store/common'
import { Formik } from 'formik';
import { Toast } from '@/common'
import { context , markWalletPasswordEnabled } from '@tangle-pay/domain';
import * as Yup from 'yup';

export const EnablePasswordDialog = ({ dialogRef, data }) => {
  const [contentW, setContentW] = useState(375);
  const [isShow, setShow] = useState(false);
  const cbRef = useRef()
  const editWallet = useEditWallet();
  useImperativeHandle(dialogRef, () => {
    return {
      show
    };
  });

  const show = (cb) => {
    cbRef.current = cb
    setShow(true);
  };

  const hide = () => {
    if (cbRef.current) {
        cbRef.current().then(()=>{
            setShow(false);
        })
    }
  };

  useEffect(() => {
    
    setContentW(document.getElementById('app').offsetWidth);
  }, []);

  return (
    <Mask opacity={0.3} onMaskClick={hide} visible={isShow}>
      <div
        style={{ width: contentW - 32 }}
        className='radius10 bgW p16 pa-c wallet-password-dialog'
      >
        <Formik
          initialValues={{
            newPassword: '',
            retypePassword: ''
          }}
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={false}
          validationSchema={Yup.object().shape({
            newPassword: Yup.string().required(),
            retypePassword: Yup.string()
              .required()
              .oneOf([Yup.ref('newPassword'), null], I18n.t('account.passwordMismatch'))
          })}
          onSubmit={async (values, {resetForm}) => {
            // Add your logic for changing the wallet password here
            const isPassword = await IotaSDK.checkPassword(data.seed, context.state.pin)
            if (!isPassword) {
                return Toast.error(I18n.t('assets.passwordError'))
            }
            if (values.newPassword !== values.retypePassword) {
                return Toast.errors(I18n.t('account.passwordMismatch'));
            }
            if (!Base.checkPassword(values.newPassword)) {
              return Toast.error(I18n.t('account.intoPasswordTips'))
            }
            console.log('wallet data', data)
            console.log('form values', values)
            editWallet(data.id, {...data, password: values.retypePassword,oldPassword: context.state.pin}, true)
            await markWalletPasswordEnabled(data.id);
            Toast.success(I18n.t('account.passwordEnabled'))
            resetForm()
            hide();
          }}
        >
          {({ handleChange, handleSubmit, values, errors }) => (
            <Form>
              <div className='mb10 fz18 fw600'>{I18n.t('account.walletPasswordTitle')}</div>
              <Form.Item className={`pl0 ${errors.newPassword && 'form-error'}`}>
                <Input
                  type='password'
                  className='new-password-input'
                  placeholder={I18n.t('account.enterNewPassword')}
                  onChange={handleChange('newPassword')}
                  value={values.newPassword}
                />
              </Form.Item>
              <Form.Item className={`pl0 ${errors.retypePassword && 'form-error'}`}>
                <Input
                  type='password'
                  className='retype-password-input'
                  placeholder={I18n.t('account.retypeNewPassword')}
                  onChange={handleChange('retypePassword')}
                  value={values.retypePassword}
                />
              </Form.Item>
              <div className='mt24'>
                <Button color='primary' size='large' block onClick={handleSubmit}>
                  {I18n.t('assets.confirm')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Mask>
  );
};