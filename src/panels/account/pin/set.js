// SetPin.js
import React from 'react';
import { Formik } from 'formik';
import { Form, Input, Button } from 'antd-mobile';
import * as Yup from 'yup';
import { Nav, Toast } from '@/common';
import { Base, I18n } from '@tangle-pay/common'
import { setPin } from '@tangle-pay/domain'

const schema = Yup.object().shape({
  newPin: Yup.string().required(),
  retypedPin: Yup.string().required(),
});

export const AccountSetPin = () => {
  return (
    <div className="page">
      <Nav title={I18n.t('account.setPinTitle')} />
      <div>
        <Formik
          initialValues={{}}
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={false}
          validationSchema={schema}
          onSubmit={async (values) => {
            const { newPin, retypedPin } = values;
            if (newPin !== retypedPin) {
              return Toast.error(I18n.t('account.pinMismatch'));
            }
            await setPin(newPin);
            Toast.success(I18n.t('account.pinResetSuccess'));
            Base.push('/main');
          }}
        >
          {({ handleChange, handleSubmit, values, errors }) => (
            <div className="ph16 pt8">
              <Form>
                <Form.Item className={`mt5 pl0 ${errors.newPin && 'form-error'}`}>
                  <div className="fz18 mb10">{I18n.t('account.newPin')}</div>
                  <Input
                    className="pt4"
                    placeholder={I18n.t('account.enterNewPin')}
                    onChange={handleChange('newPin')}
                    value={values.newPin}
                  />
                </Form.Item>
                <Form.Item className={`pl0 ${errors.retypedPin && 'form-error'}`}>
                  <div className="fz18 mb10">{I18n.t('account.retypePin')}</div>
                  <Input
                    className="pt4"
                    placeholder={I18n.t('account.retypeNewPin')}
                    onChange={handleChange('retypedPin')}
                    value={values.retypedPin}
                  />
                </Form.Item>
                <div style={{ marginTop: 100 }}>
                  <Button size="large" color="primary" block onClick={handleSubmit}>
                    {I18n.t('account.setPinButton')}
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
