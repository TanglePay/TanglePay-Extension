// PinInputView.js
import React, { useRef } from 'react';
import { I18n } from '@tangle-pay/common';
import {MaskedInput} from '@/common'
import { Button } from 'antd-mobile';
import { default as logo_nobg } from '@tangle-pay/assets/images/logo_nobg.png'
import './PinInputView.less';
const PinInputView = ({ errorMessage, onSubmit }) => {
  const [pinValue,setPinValue] = React.useState('')
  const handleCompleted = async (value) => {
    const isSuccess = await onSubmit(value);
    if (!isSuccess) {
      setPinValue('')
    }
  };

  return (
    <div className="page flex column jc ac pin-input-view">
      <img className='logo' src={logo_nobg} alt="logo" />
      <div className="flex column jc as btUnlock" style={{marginTop:'114px'}}>
        <div className='fz32'>{I18n.t('account.welcomeBack')}</div>
        <div className='fz14' style={{marginTop:'18.5px'}}>{I18n.t('account.typeYourPin')}</div>
        <MaskedInput
          style={{borderBottom:'1px solid #E5E5E5',fontSize:'12px'}}
          onChange={setPinValue}
          value={pinValue}
          maxLength={20}
        />
        <div className='cR' style={{height:'18px'}}>{errorMessage}</div>
        <div className='w100' style={{marginTop:'8.4px'}}>
            <Button color='primary' size='large' block onClick={()=>{
              handleCompleted(pinValue).catch(e=>console.log(e))
            }}>
              {I18n.t('assets.confirm')}
            </Button>
        </div>
      </div>
      
    </div>
  );
};

export default PinInputView;