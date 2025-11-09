// app/api/reservations/[id]/route.ts
// 特定の予約のステータス更新（承認・却下・キャンセル）および削除API

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH: 特定の予約のステータスを更新する (承認/却下/キャンセル)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await req.json();

    // 受け付けるステータスを定義
    const allowedStatus: string[] = ["APPROVED", "REJECTED", "CANCELLED"];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: "無効なステータスです" },
        { status: 400 }
      );
    }

    // TODO: ここで権限チェックを実装するのが望ましい
    // 例: statusが 'CANCELLED' の場合は、リクエストしたユーザーが予約者本人か確認する
    // 例: statusが 'APPROVED'/'REJECTED' の場合は、リクエストしたユーザーが管理者か確認する

    const updatedReservation = await prisma.reservation.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("[RESERVATION_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: 指定されたIDの予約を物理的に削除する
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: 管理者のみが削除できるように、ここで権限チェックを実装する

    await prisma.reservation.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 }); // 成功時は No Content
  } catch (error) {
    console.error("予約削除エラー:", error);
    if ((error as any)?.code === "P2025") {
      // Prisma: Record to delete does not exist.
      return NextResponse.json(
        { error: "対象の予約が見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "予約の削除に失敗しました" },
      { status: 500 }
    );
  }
}
