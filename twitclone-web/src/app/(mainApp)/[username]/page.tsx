"use client";

import { useParams } from "next/navigation";
import { UserPage } from "@/components/pages/UserPage";

export default function Page() {
  const params = useParams();
  const username = params.username as string;

  return <UserPage username={username} />;
}
