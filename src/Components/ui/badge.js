import React from 'react';
export function Badge({ children, className = '' }) { return <span className={"inline-block px-2 py-1 rounded-full text-xs " + className}>{children}</span>; }
export default Badge;
