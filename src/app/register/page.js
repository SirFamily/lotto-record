'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard'); // Redirect if already logged in
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(username, password);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (user) {
    return null; // Already logged in, redirecting
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-zinc-700 dark:text-zinc-50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-zinc-700 dark:text-zinc-50"
            required
          />
          <button
            type="submit"
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Register
          </button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </main>
    </div>
  );
}
