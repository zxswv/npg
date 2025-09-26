// src/app/api/Reservation/route.ts
// 予約の登録・取得（部屋・スロット含む）

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: 予約作成
export async function POST(req: Request) {
  const { personName, note, slotId, roomId } = await req.json();
  const reservation = await prisma.reservation.create({
    data: {
      personName,
      note,
      slotId,
      roomId,
    },
  });
  return NextResponse.json(reservation);
}

// GET: 予約取得（部屋・スロット含む）
export async function GET() {
  const reservations = await prisma.reservation.findMany({
    include: {
      slot: true,
      room: true,
    },
  });
  return NextResponse.json(reservations);
}
