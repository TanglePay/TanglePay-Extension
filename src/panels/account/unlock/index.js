import React from 'react';
import { Base } from '@tangle-pay/common'
import { context } from '@tangle-pay/domain'
import UnlockViewModel from '../../../common/viewmodel/UnlockViewModel';
import PinInputView from './PinInputView';

export const UnlockScreen = () => {
    const successCallback = () => {
        Base.push(context.state.walletCount > 0 ? '/main' : '/account/changeNode')
    }

  return (
    <div className="App">
     <UnlockViewModel PinView={PinInputView} successCallback={successCallback} />
    </div>
  );
  
}