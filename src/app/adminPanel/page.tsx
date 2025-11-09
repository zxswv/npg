//app/adminPanel/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";

type ReservationLog = {
  id: string;
  personName: string;
  grade: string;
  className: string;
  purpose: string | null;
  numberOfUsers: number | null;
  createdAt: string;
  room: { number: string; name: string };
  slot: { startTime: string };
};

export default function AdminPanelPage() {
  const [pendingReservations, setReservationLogs] = useState<ReservationLog[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // 申請中(PENDING)の予約のみを取得する関数
  const fetchReservationLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reservations?status=PENDING");
      if (!res.ok) throw new Error("申請中データの取得に失敗しました");
      const data = await res.json();
      setReservationLogs(data);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservationLogs();
  }, [fetchReservationLogs]);

  // --- ↓ 承認・却下を実行する関数 ---
  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    toast.promise(
      // APIのエンドポイントをよりRESTfulな形式に変更
      fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error("更新に失敗しました");
        return res.json();
      }),
      {
        loading: "ステータス更新中...",
        success: () => {
          fetchReservationLogs(); // リストを再読み込み
          return `予約を${status === "APPROVED" ? "承認" : "却下"}しました。`;
        },
        error: "更新処理に失敗しました。",
      }
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">予約承認管理</h1>
        <p className="text-muted-foreground">
          申請中の予約を承認または却下します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>承認待ちの予約一覧</CardTitle>
          <CardDescription>
            現在 {pendingReservations.length}件の申請があります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : (
            <div className="space-y-4">
              {pendingReservations.length > 0 ? (
                pendingReservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4 bg-secondary/30"
                  >
                    <div className="flex-grow">
                      <p className="font-bold text-lg">
                        {r.room.number} ({r.room.name})
                      </p>
                      <p className="font-semibold text-primary">
                        {new Date(r.slot.startTime).toLocaleString("ja-JP", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        申請者: {r.grade} / {r.className} - {r.personName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        用途: {r.purpose || "---"} ({r.numberOfUsers || "？"}名)
                      </p>
                    </div>
                    <div className="flex gap-2 self-end md:self-center flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                      >
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                      >
                        却下
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  現在、申請中の予約はありません。
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
