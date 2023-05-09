import React from 'react';
import { Input } from 'antd-mobile';

export const MaskedInput = ({ maxLength, value, onChange, ...props }) => {
  const maskedValue = value? value.replace(/./g, '*') : value;

  const handleInputChange = (e) => {
    const masked = e ??'';
    let neoValue = value ?? '';
    if (masked.length > neoValue.length) {
        const lastChar = masked[masked.length - 1];
        neoValue = neoValue + lastChar;
    } else {
        neoValue = neoValue.slice(0, masked.length);
    }
    const inputValue = neoValue.slice(0, maxLength);
    console.log('unmasked value', inputValue);
    onChange(inputValue);
  };

  return (
    <Input
      {...props}
      type="tel"
      maxLength={maxLength}
      value={maskedValue}
      onChange={handleInputChange}
    />
  );
};
