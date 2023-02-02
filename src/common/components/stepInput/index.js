import React from 'react'
import { Stepper } from 'antd-mobile'
import './index.less'

export const StepInput = (props) => {
    return (
        <div className='stepper-con'>
            <Stepper min={0} step={1} {...props} />
        </div>
    )
}
