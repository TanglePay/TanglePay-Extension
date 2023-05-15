import React from 'react';
import { Formik } from 'formik';
import { Form,  Button, Input } from 'antd-mobile';
import * as Yup from 'yup';
import { Nav, Toast } from '@/common';
import { Base, I18n } from '@tangle-pay/common'
import { context, checkPin, resetPin } from '@tangle-pay/domain'
import { useEditWallet } from '@tangle-pay/store/common'

const schema = Yup.object().shape({
  oldPin: Yup.string().required(),
  newPin: Yup.string().required(),
  retypedPin: Yup.string().required(),
});

export const AccountResetPin = () => {
  const editWallet = useEditWallet();

  return (
    <div className="page">
      <Nav title={I18n.t('account.resetPinTitle')} />
      <div>
        <Formik
          initialValues={{}}
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={false}
          validationSchema={schema}
          onSubmit={async (values) => {
            const { oldPin, newPin, retypedPin } = values;
            
            if (!Base.checkPin(newPin)) {
              return Toast.error(I18n.t('account.intoPinTips'))
            }
            if (newPin !== retypedPin) {
              return Toast.error(I18n.t('account.pinMismatch'));
            }
            if (!await checkPin(oldPin)) {
              return Toast.error(I18n.t('account.invalidOldPin'));
            }
            await resetPin(oldPin,newPin, editWallet);
            Toast.success(I18n.t('account.pinResetSuccess'));
            Base.push('/main');
          }}
        >
          {({ handleChange, handleSubmit, values, errors }) => (
            <div className="ph16 pt8">
              <Form>
                <Form.Item className={`mt5 pl0 ${errors.oldPin && 'form-error'}`}>
                  <div className="fz18 mb10">{I18n.t('account.oldPin')}</div>
                  <Input
                    type='password'
                    className="pt4"
                    placeholder={I18n.t('account.enterOldPin')}
                    onChange={handleChange('oldPin')}
                    value={values.oldPin}
                    maxLength={20}
                  />
                </Form.Item>
                <Form.Item className={`mt10 pl0 ${errors.newPin && 'form-error'}`}>
                  <div className="fz18 mb10">{I18n.t('account.newPin')}</div>
                  <Input
                    type='password'
                    className="pt4"
                    placeholder={I18n.t('account.enterNewPin')}
                    onChange={handleChange('newPin')}
                    value={values.newPin}
                    maxLength={20}
                  />
                </Form.Item>
                <Form.Item className={`pl0 ${errors.retypedPin && 'form-error'}`}>
                  <Input
                    type='password'
                    className="pt4"
                    placeholder={I18n.t('account.retypeNewPin')}
                    onChange={handleChange('retypedPin')}
                    value={values.retypedPin}
                    maxLength={20}
                  />
                </Form.Item>
                <div style={{ marginTop: 100 }}>
                  <Button size="large" color="primary" block onClick={handleSubmit}>
                    {I18n.t('account.resetPinButton')}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
};
