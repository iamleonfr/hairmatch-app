import React from 'react';
export function Select({ children, className = '' }) { return <select className={"border p-2 rounded " + className}>{children}</select>; }
export function SelectTrigger() { return null; }
export function SelectContent() { return null; }
export function SelectItem({ children, value }) { return <option value={value}>{children}</option>; }
export function SelectValue() { return null; }
export default Select;
