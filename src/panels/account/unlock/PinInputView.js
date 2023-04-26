// PinInputView.js
import React, { useRef } from 'react';
import { I18n } from '@tangle-pay/common';
import PinInput from 'react-pin-input';
import { Button } from 'antd-mobile';
import { default as logo_nobg } from '@tangle-pay/assets/images/logo_nobg.png'
import './PinInputView.less';
const PinInputView = ({ errorMessage, onSubmit }) => {
  const pin = useRef();
  const pinValueRef = useRef();
  const handleCompleted = async (value) => {
    const isSuccess = await onSubmit(value);
    if (!isSuccess) {
      pin.current.clear();
      pin.current.focus();
    }
  };

  return (
    <div className="page flex column jc ac pin-input-view">
      <img className='logo' src={logo_nobg} alt="logo" />
      <div className="flex column jc as btUnlock" style={{marginTop:'114px'}}>
        <div className='fz32'>{I18n.t('account.welcomeBack')}</div>
        <div className='fz14' style={{marginTop:'18.5px'}}>{I18n.t('account.typeYourPin')}</div>
        <PinInput
          ref={pin}
          length={6}
          secret
          onChange={v=>{console.log(v); pinValueRef.current = v}}
          onComplete={handleCompleted}
          autoFocus
          style={{ height:'45.7px', padding: '10px' }}
          inputStyle={{ width:'40px', height:'27.7px', borderBottom: '1px solid silver',borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none', }}
          inputFocusStyle={{ borderBottom: '1px solid gray' }}
        />
        <div className='cR' style={{height:'18px'}}>{errorMessage}</div>
        <div className='w100' style={{marginTop:'8.4px'}}>
            <Button color='primary' size='large' block onClick={()=>{
              handleCompleted(pinValueRef.current).catch(e=>console.log(e))
            }}>
              {I18n.t('assets.confirm')}
            </Button>
        </div>
      </div>
      
    </div>
  );
};

export default PinInputView;