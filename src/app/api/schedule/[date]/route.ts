// src/app/api/schedule/[date]/route.ts
// 特定日のスケジュールと空き状況

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// /api/schedule/2025-08-01
export async function GET(
  _req: Request,
  { params }: { params: { date: string } }
) {
  const date = new Date(params.date);
  const schedule = await prisma.schedule.findFirst({
    where: { date },
    include: {
      slots: {
        include: {
          reservations: true,
        },
      },
    },
  });

  const result = schedule?.slots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    reservedCount: slot.reservations.length,
  }));

  return NextResponse.json(result);
}
