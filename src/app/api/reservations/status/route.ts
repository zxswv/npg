// app/api/reservations/status/route.ts
// 予約のステータス更新（承認・却下）

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH: 予約のステータスを更新する (承認/却下)
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "無効なリクエストです" },
        { status: 400 }
      );
    }
    // --- "REJECTED" の場合の処理 ---
    if (status === "REJECTED") {
      // 却下の場合は、予約レコードを完全に削除する
      await prisma.reservation.delete({
        where: { id: id },
      });
      // 成功レスポンスを返す
      return new NextResponse(null, { status: 204 }); // No Content
    }

    // --- 承認時の重複チェック ---
    // --- "APPROVED" の場合の処理 ---
    if (status === "APPROVED") {
      const targetReservation = await prisma.reservation.findUnique({
        where: { id },
        include: { slot: true },
      });

      if (!targetReservation) {
        return NextResponse.json(
          { error: "対象の予約が見つかりません" },
          { status: 404 }
        );
      }

      // 同じスロット・部屋で、既に承認済みの予約がないかチェック
      const existingApproved = await prisma.reservation.findFirst({
        where: {
          status: "APPROVED",
          slotId: targetReservation.slotId,
          roomId: targetReservation.roomId,
          // 自分自身はチェック対象から外す
          NOT: { id: id },
        },
      });

      if (existingApproved) {
        return NextResponse.json(
          { error: "この時間枠は既に他の予約が承認されています" },
          { status: 409 }
        );
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("ステータス更新エラー:", error);
    return NextResponse.json(
      { error: "ステータスの更新に失敗しました" },
      { status: 500 }
    );
  }
}
