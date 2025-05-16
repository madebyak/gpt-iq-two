"use client";

import dynamic from 'next/dynamic';

// Dynamically import Navbar with SSR turned off to reinforce client boundary
const Navbar = dynamic(() => import('@/components/layout/navbar'), {
  ssr: false,
  // Optional: Add a loading skeleton if Navbar has significant layout
  // loading: () => <div style={{ height: '64px', background: '#eee' }} /> 
});

export default function NavbarClient() {
  return <Navbar />;
} 