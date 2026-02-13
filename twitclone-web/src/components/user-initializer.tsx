"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user-store";

export function UserInitializer() {
  useEffect(() => {
    useUserStore.getState().fetchUser();
  }, []);

  return null;
}
