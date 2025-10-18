import React from 'react';
export function Card({ children, className = '', ...props }) {
  return <div className={"rounded-lg bg-white shadow-sm " + className} {...props}>{children}</div>;
}
export function CardHeader({ children, className = '' }) { return <div className={"px-4 py-3 border-b " + className}>{children}</div>; }
export function CardContent({ children, className = '' }) { return <div className={"p-4 " + className}>{children}</div>; }
export function CardTitle({ children, className = '' }) { return <h3 className={"font-semibold " + className}>{children}</h3>; }

export default Card;
