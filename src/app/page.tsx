// src/app/page.tsx
// "use client";

import * as React from "react";
import Booking_Calendar from "./components/Calender/Booking_Calendar";
import { prisma } from "@/lib/prisma";
import NewSchedulePage from "./components/schedule/new/page";

export default async function Home() {
  return (
    <main>
      {/* <Booking_Calendar /> */}
      <NewSchedulePage />
    </main>
  );
}
