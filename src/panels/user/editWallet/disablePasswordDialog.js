import React, { useState, useImperativeHandle, useEffect, useRef } from 'react';
import { Button, Mask, Form, Input } from 'antd-mobile';
import { I18n, Base, IotaSDK } from '@tangle-pay/common';
import { useEditWallet } from '@tangle-pay/store/common'
import { Toast } from '@/common'
import { context , markWalletPasswordDisabled } from '@tangle-pay/domain';
import { Formik } from 'formik';
import * as Yup from 'yup';

export const DisablePasswordDialog = ({ dialogRef, data }) => {
  const [contentW, setContentW] = useState(375);
  const [isShow, setShow] = useState(false);
  const callBackRef = useRef();
  const editWallet = useEditWallet();
  useImperativeHandle(
    dialogRef,
    () => {
      return {
        show,
      };
    },
    []
  );

  const show = (callback) => {
    callBackRef.current = callback;
    setShow(true);
  };

  const hide = () => {
    if (callBackRef.current) {
        callBackRef.current().then(() => {      
            setShow(false);
        })
    }
  };

  useEffect(() => {
    setContentW(document.getElementById('app').offsetWidth);
  }, []);

  return (
    <Mask opacity={0.3} onMaskClick={hide} visible={isShow}>
      <div style={{ width: contentW - 32 }} className="radius10 bgW p16 pa-c disable-password-dialog">
        <Formik
          initialValues={{
            currentPassword: '',
          }}
          isValidating={true}
          validationSchema={Yup.object().shape({
            currentPassword: Yup.string().required(),
          })}
          onSubmit={async (values, {resetForm}) => {
            // Disable wallet password logic here
            console.log('wallet data', data)
            console.log('form values', values)
            const isPassword = await IotaSDK.checkPassword(data.seed, values.currentPassword)
            if (!isPassword) {
                return Toast.error(I18n.t('account.passwordError'));
            }
            
            editWallet(data.id, {...data, password: context.state.pin, oldPassword: values.currentPassword}, true)
            await markWalletPasswordDisabled(data.id);
            Toast.success(I18n.t('account.passwordDisabled'))
            resetForm();
            hide();
          }}>
          {({ handleChange, handleSubmit, values, errors, resetForm }) => (
            <Form>
              <div className="mb10 fz18 fw600">{I18n.t('account.enterCurrentPassword')}</div>
              <Form.Item className={`pl0 ${errors.currentPassword && 'form-error'}`}>
                <Input
                  className="password-input"
                  placeholder={I18n.t('account.enterCurrentPassword')}
                  onChange={handleChange('currentPassword')}
                  value={values.currentPassword}
                />
              </Form.Item>
              <div className="mt24">
                <Button color="primary" size="large" block onClick={handleSubmit}>
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
