// src/app/api/Reservation/route.ts
// 予約の登録・取得（部屋・スロット含む）

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";

// GET: 予約の一覧を取得する
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const whereCondition: { status?: ReservationStatus } = {};

    if (status && status.toUpperCase() !== "ALL") {
      const validStatuses: ReservationStatus[] = [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ];
      if (validStatuses.includes(status.toUpperCase() as ReservationStatus)) {
        whereCondition.status = status.toUpperCase() as ReservationStatus;
      }
    }

    const reservations = await prisma.reservation.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        personName: true,
        grade: true,
        className: true,
        purpose: true,
        numberOfUsers: true,
        note: true,
        createdAt: true,
        room: { select: { name: true, number: true } },
        slot: { select: { startTime: true } },
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("[RESERVATIONS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: 新しい予約を作成する (単一・一括の両対応)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (Array.isArray(body.slots)) {
      // --- 1. 一括予約 (Bulk Reservation) の処理 ---
      const { date, slots, ...commonData } = body;
      if (
        !date ||
        !slots ||
        slots.length === 0 ||
        !commonData.personName ||
        !commonData.grade ||
        !commonData.className
      ) {
        return NextResponse.json(
          { error: "必須項目が不足しています" },
          { status: 400 }
        );
      }

      // トランザクションで重複チェックと作成をアトミックに行う
      await prisma.$transaction(async (tx) => {
        const targetDate = new Date(`${date}T00:00:00.000Z`);
        const schedule = await tx.schedule.findUnique({
          where: { date: targetDate },
        });
        if (!schedule) throw new Error("スケジュールが見つかりません");

        const slotIds = await Promise.all(
          slots.map(async (s: { time: string }) => {
            const startTime = new Date(`${date}T${s.time}:00.000Z`);
            const slot = await tx.slot.findFirst({
              where: { scheduleId: schedule.id, startTime: startTime },
              select: { id: true },
            });
            if (!slot) throw new Error(`時間枠 ${s.time} が見つかりません`);
            return slot.id;
          })
        );

        // 予約を作成する前に、対象スロットが既に予約されていないかチェック
        const existingReservations = await tx.reservation.count({
          where: {
            slotId: { in: slotIds },
            status: { notIn: ["REJECTED", "CANCELLED"] },
          },
        });

        if (existingReservations > 0) {
          throw new Error("ALREADY_BOOKED");
        }

        const reservationsToCreate = slots.map(
          (s: { roomId: number }, index: number) => ({
            ...commonData,
            roomId: s.roomId,
            slotId: slotIds[index],
          })
        );

        await tx.reservation.createMany({ data: reservationsToCreate });
      });

      return NextResponse.json(
        { message: "予約が正常に作成されました" },
        { status: 201 }
      );
    } else {
      // --- 2. 単一予約 (Single Reservation) の処理 ---
      const { date, time, roomId, ...restData } = body;
      if (
        !date ||
        !time ||
        !roomId ||
        !restData.personName ||
        !restData.grade ||
        !restData.className
      ) {
        return NextResponse.json(
          { error: "必須項目が不足しています" },
          { status: 400 }
        );
      }

      const targetDate = new Date(`${date}T00:00:00.000Z`);
      const schedule = await prisma.schedule.findUnique({
        where: { date: targetDate },
      });
      if (!schedule) {
        return NextResponse.json(
          { error: "スケジュールが見つかりません" },
          { status: 404 }
        );
      }

      const startTime = new Date(`${date}T${time}:00.000Z`);
      const slot = await prisma.slot.findFirst({
        where: { scheduleId: schedule.id, startTime: startTime },
      });
      if (!slot) {
        return NextResponse.json(
          { error: `指定された時間枠(${time})が見つかりません` },
          { status: 404 }
        );
      }

      // 単一予約でも重複チェックを行う
      const existing = await prisma.reservation.findFirst({
        where: {
          slotId: slot.id,
          status: { notIn: ["REJECTED", "CANCELLED"] },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "この時間枠は既に予約されています" },
          { status: 409 }
        );
      }

      const newReservation = await prisma.reservation.create({
        data: { ...restData, roomId, slotId: slot.id },
      });
      return NextResponse.json(newReservation, { status: 201 });
    }
  } catch (error: any) {
    if (error.message === "ALREADY_BOOKED") {
      return NextResponse.json(
        { error: "選択したスロットの一部は既に予約されています" },
        { status: 409 }
      );
    }
    console.error("[RESERVATIONS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
