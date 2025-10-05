import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE: 指定されたIDの予約を削除する
export async function DELETE(
  req: Request, // req は使いませんが、シグネチャとして必要
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "予約IDが指定されていません" },
        { status: 400 }
      );
    }

    // --- 権限チェックをして削除をするロジックを追加予定 ---
    // 現在はシンプルに、IDがあれば削除できる状態

    await prisma.reservation.delete({
      where: { id: id },
    });

    // 成功した場合、中身のない 204 No Content レスポンスを返すのが一般的
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("予約キャンセルエラー:", error);
    // PrismaのエラーコードP2025は、削除対象が見つからなかった場合
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "対象の予約が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "予約のキャンセルに失敗しました" },
      { status: 500 }
    );
  }
}
