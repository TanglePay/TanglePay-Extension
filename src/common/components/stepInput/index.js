import React, { useState, useEffect } from 'react'
import { Input } from 'antd-mobile'
import BigNumber from 'bignumber.js'
import { IotaSDK } from '@tangle-pay/common'
import './index.less'

// export const StepInput = (props) => {
//     return (
//         <div className='stepper-con'>
//             <Stepper max={10000000000000000} min={0} step={1} {...props} />
//         </div>
//     )
// }

export const StepInput = (props) => {
    const { value, onChange } = props
    const [inputValue, setValue] = useState(value)
    useEffect(() => {
        setValue(value)
    }, [value])
    const handleReduce = () => {
        if (inputValue && inputValue > 0) {
            setValue(IotaSDK.getNumberStr(BigNumber(inputValue).minus(1).valueOf()))
        }
    }
    const handlePlus = () => {
        setValue(IotaSDK.getNumberStr(BigNumber(inputValue).plus(1).valueOf()))
    }
    return (
        <div className='flex ac row'>
            <Input
                style={{ flex: 1 }}
                value={String(inputValue)}
                onChange={(e) => {
                    onChange(parseInt(e))
                }}
                maxLength={18}
                className='mr12 p10'
            />
            <div
                className='press bgW border flex c cP fw600 fz11 mr12'
                onClick={handleReduce}
                style={{
                    borderColor: '#3671ee',
                    height: '20px',
                    width: '20px',
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    lineHeight: '20px'
                }}>
                —
            </div>
            <div
                className='press bgW border flex c cP fw600 fz22'
                onClick={handlePlus}
                style={{
                    borderColor: '#3671ee',
                    height: '20px',
                    width: '20px',
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    lineHeight: '20px'
                }}>
                +
            </div>
        </div>
    )
}
