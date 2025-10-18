import React from 'react';
export function Button({ children, className = '', ...props }) {
  return (
    <button className={"inline-flex items-center justify-center px-3 py-2 rounded " + className} {...props}>
      {children}
    </button>
  );
}

export default Button;
