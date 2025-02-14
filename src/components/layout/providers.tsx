'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export default function Providers({
  session,
  children
}: {
  session: SessionProviderProps['session'];
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (
    <>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <SessionProvider session={session}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
