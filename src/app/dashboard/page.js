'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null; // Already logged in, redirecting
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          Dashboard
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Welcome to your dashboard, {user.username}!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link href="/buy-lottery" className="p-4 bg-blue-500 text-white rounded-md text-center hover:bg-blue-600">
            ซื้อหวย (Buy Lottery)
          </Link>
          <Link href="/purchase-history" className="p-4 bg-green-500 text-white rounded-md text-center hover:bg-green-600">
            ประวัติการซื้อ (Purchase History)
          </Link>
          <Link href="/system-management" className="p-4 bg-purple-500 text-white rounded-md text-center hover:bg-purple-600">
            จัดการระบบ (System Management)
          </Link>
        </div>
      </main>
    </div>
  );
}
