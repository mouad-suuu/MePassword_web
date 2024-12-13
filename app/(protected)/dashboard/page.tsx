'use client';

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Welcome back, {user?.firstName}!
      </h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Password Stats Card */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Password Stats
          </h5>
          <p className="text-gray-700 dark:text-gray-400">
            Coming soon...
          </p>
        </div>

        {/* Recent Activity Card */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Recent Activity
          </h5>
          <p className="text-gray-700 dark:text-gray-400">
            Coming soon...
          </p>
        </div>

        {/* Security Score Card */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Security Score
          </h5>
          <p className="text-gray-700 dark:text-gray-400">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
