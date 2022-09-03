import React from 'react'
import { ReactSVG } from 'react-svg'

const getAll = (context) => {
    return context.keys().reduce((o, modulePath, i) => {
        o[modulePath.replace(/.\/|.svg/g, '')] = (props) => {
            return <ReactSVG src={context.keys().map(context)[i]} {...props} />
        }
        return o
    }, {})
}
const iconsDic = getAll(require.context('@tangle-pay/assets/svgs', false, /\.svg$/))
export const SvgIcon = (props) => {
    let { name, color, size, style = {} } = props
    style = { width: size, height: size, ...style }
    const Icon = iconsDic[name]
    return (
        <Icon
            beforeInjection={(svg) => {
                svg.setAttribute('style', `color:${color};width:${size}px;height:${size}px;`)
            }}
            {...props}
            style={{ ...style }}
        />
    )
}
