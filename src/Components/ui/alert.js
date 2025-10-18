import React from 'react';
export function Alert({ children, className = '' }) { return <div className={"p-3 rounded border-l-4 bg-yellow-50 " + className}>{children}</div>; }
export function AlertDescription({ children }) { return <div className="text-sm text-gray-700">{children}</div>; }
export default Alert;
