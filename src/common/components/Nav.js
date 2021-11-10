import React from 'react'
import { NavBar } from 'antd-mobile'
import { Base } from '@/common/base'
export const Nav = ({ title, onLeft, backArrow }) => {
    if (onLeft !== false) {
        onLeft = Base.goBack.bind(Base)
    }
    return (
        <NavBar backArrow={backArrow} onBack={onLeft}>
            {title}
        </NavBar>
    )
}
