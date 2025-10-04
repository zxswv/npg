import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { date, slots, personName, grade, className } = await req.json();

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
      slots.map(async (s: { roomId: number; time: string }) => {
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
          roomId: s.roomId,
          slotId: slot.id,
        };
      })
    );

    // 予約を一括作成
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
