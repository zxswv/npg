// npg/src/app/api/reservations/bulk/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      date,
      slots,
      personName,
      grade,
      className,
      purpose,
      numberOfUsers,
      note,
    } = await req.json();

    if (
      !date ||
      !slots ||
      slots.length === 0 ||
      !personName ||
      !grade ||
      !className
    ) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // 重複するスロットを排除
    const uniqueSlots = Array.from(
      new Map(slots.map((s: any) => [`${s.roomId}-${s.time}`, s])).values()
    );

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

    // フロントから来たslots情報をもとに、DBのSlot IDを検索
    const reservationsToCreate = await Promise.all(
      uniqueSlots.map(async (s: any) => {
        const startTime = new Date(`${date}T${s.time}:00.000Z`);
        const slot = await prisma.slot.findFirst({
          where: { scheduleId: schedule.id, startTime: startTime },
          select: { id: true },
        });

        if (!slot) throw new Error(`時間枠 ${s.time} が見つかりません`);

        return {
          personName,
          grade,
          className,
          purpose: purpose || null,
          numberOfUsers: numberOfUsers ? Number(numberOfUsers) : null,
          note: note || null,
          roomId: s.roomId,
          slotId: slot.id,
        };
      })
    );

    // 既に予約されていないか、再度ここでチェックする（より安全）
    const existingReservations = await prisma.reservation.findMany({
      where: {
        OR: reservationsToCreate.map((r) => ({
          slotId: r.slotId,
          roomId: r.roomId,
        })),
      },
    });

    if (existingReservations.length > 0) {
      return NextResponse.json(
        {
          error:
            "選択したスロットの一部は、既に他のユーザーによって予約されています。",
        },
        { status: 409 }
      );
    }

    await prisma.reservation.createMany({
      data: reservationsToCreate,
    });

    return NextResponse.json(
      { message: "予約が正常に作成されました" },
      { status: 201 }
    );
  } catch (error) {
    console.error("一括予約エラー:", error);
    if (error instanceof Error && (error as any).code === "P2002") {
      return NextResponse.json(
        { error: "選択した中に既に予約済みのスロットが含まれています" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}
