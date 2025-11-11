
'use client';

import React from 'react';

// Basic layout without protection for debugging purposes
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
     <div>
        {/* The protection logic has been temporarily removed to fix build errors. */}
        {children}
    </div>
  );
}
