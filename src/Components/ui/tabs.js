import React from 'react';
export function Tabs({ children }) { return <div>{children}</div>; }
export function TabsList({ children }) { return <div className="flex gap-2">{children}</div>; }
export function TabsTrigger({ children }) { return <button className="px-3 py-1 border rounded">{children}</button>; }
export function TabsContent({ children }) { return <div className="p-2">{children}</div>; }
export default Tabs;
