'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex justify-between items-center">
        <li>
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li className="flex gap-4">
          {user ? (
            <>
              <span className="mr-4">Welcome, {user.username}</span>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <button onClick={logout} className="hover:text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
}
