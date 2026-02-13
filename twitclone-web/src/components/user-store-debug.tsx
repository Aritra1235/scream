"use client";

import { useUserStore } from "@/store/user-store";

export function UserStoreDebug() {
  const { user, isLoading, error } = useUserStore();

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data</div>;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs font-mono z-50 max-w-sm overflow-auto max-h-96">
      <h3 className="font-bold mb-2">User Store Debug</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
