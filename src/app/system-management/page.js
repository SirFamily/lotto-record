'use client';

export default function SystemManagementPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          System Management
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          This is the System Management page.
        </p>
      </main>
    </div>
  );
}
