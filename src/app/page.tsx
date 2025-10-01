// src/app/page.tsx
// "use client";

import * as React from "react";
import ReservationsPage from "./components/reservations/page";

export default async function Home() {
  return (
    <main>
      <ReservationsPage />
    </main>
  );
}
