import React, { useState, useImperativeHandle, useEffect, useRef } from 'react';
import { Button, Mask, Form, Input } from 'antd-mobile';
import { I18n, Base, IotaSDK } from '@tangle-pay/common';
import { Toast } from '@/common'


export const ConfirmDialog = ({ dialogRef, promise, text }) => {
  const [contentW, setContentW] = useState(375);
  const [isShow, setShow] = useState(false);
  useImperativeHandle(
    dialogRef,
    () => {
      return {
        show,
      };
    },
    []
  );

  const show = () => {
    setShow(true);
  };

  const hide = () => {
    promise && promise.reject();
    setShow(false);
  };
  const handleCancel = () => {
    promise && promise.reject();
    setShow(false);
  };
  const handleConfirm = () => {
    promise && promise.resolve();
    setShow(false);
  };
  useEffect(() => {
    setContentW(document.getElementById('app').offsetWidth);
  }, []);

  return (
    <Mask opacity={0.3} onMaskClick={hide} visible={isShow}>
      <div style={{ width: contentW - 32 }} className="radius10 bgW p16 pa-c disable-password-dialog">
        <div className="flex column jc ac" style={{height:'170px'}}>
          <div className="fz26 mb24">{text}</div>
          <div className="flex row jc ac">
                <Button color='default' style={{marginRight:'40px'}} size='large' block onClick={handleCancel}>
                  {I18n.t('apps.cancel')}
                </Button>
                <Button color='primary' size='large' block onClick={handleConfirm}>
                  {I18n.t('assets.confirm')}
                </Button>
          </div>
        </div>
      </div>
    </Mask>
  );
};
