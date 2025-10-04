// src/app/page.tsx
// "use client";

import * as React from "react";
import TimelinePage from "./timeline/page";

export default async function Home() {
  return (
    <main>
      <TimelinePage />
    </main>
  );
}
