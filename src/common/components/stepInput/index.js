import React, { useState, useEffect } from 'react'
import { Input } from 'antd-mobile'
import BigNumber from 'bignumber.js'
import { IotaSDK } from '@tangle-pay/common'
import './index.less'
import { SvgIcon } from '../../assets'

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
    useEffect(() => {
        onChange(inputValue)
    }, [inputValue])
    const handleReduce = () => {
        if (inputValue && inputValue > 1) {
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
                    e = String(e).replace(/[^0-9\.]/, '')
                    if (e.split('.').length > 2) {
                        const arr = e.split('.')
                        e = `${arr[0]}.${arr.slice(1).join('')}`
                    }
                    onChange(e)
                }}
                maxLength={12}
                className='mr12 pl0 pt4'
            />
            <SvgIcon size='20' name='minus_circle' className='press mr12' color='#3671ee' onClick={handleReduce} />
            <SvgIcon size='20' name='add_circle' className='press' color='#3671ee' onClick={handlePlus} />
        </div>
    )
}
