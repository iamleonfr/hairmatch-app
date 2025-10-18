import React from 'react';

export function Sidebar({ children, className = '' }) {
  return <aside className={"w-72 " + className}>{children}</aside>;
}

export function SidebarContent({ children, className = '' }) { return <div className={className}>{children}</div>; }
export function SidebarGroup({ children }) { return <div className="p-2">{children}</div>; }
export function SidebarGroupContent({ children }) { return <div>{children}</div>; }
export function SidebarMenu({ children }) { return <ul className="p-2">{children}</ul>; }
export function SidebarMenuItem({ children }) { return <li>{children}</li>; }
export function SidebarMenuButton({ children, className = '', asChild }) {
  return <div className={className}>{asChild ? children : <button>{children}</button>}</div>;
}
export function SidebarHeader({ children, className = '' }) { return <div className={className}>{children}</div>; }
export function SidebarFooter({ children, className = '' }) { return <div className={className}>{children}</div>; }
export function SidebarProvider({ children }) { return <div>{children}</div>; }
export function SidebarTrigger(props) { return <button {...props}>☰</button>; }

export default Sidebar;
