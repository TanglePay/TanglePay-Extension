import React from 'react'
import { Base } from '@tangle-pay/common'
import { context } from '@tangle-pay/domain'
import UnlockViewModel from '../../../common/viewmodel/UnlockViewModel'
import PinInputView from './PinInputView'

export const UnlockScreen = () => {
    const successCallback = () => {
        Base.globalDispatch({
            type: 'common.canShowDappDialog',
            data: true
        })
        const params = Base.handlerParams(window.location.search)
        Base.replace(context.state.walletCount > 0 ? '/main' : '/account/changeNode', params)
    }

    return (
        <div className='App'>
            <UnlockViewModel PinView={PinInputView} successCallback={successCallback} />
        </div>
    )
}
