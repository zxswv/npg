//app/adminPanel/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";

type ReservationLog = {
  id: string; // idはstring (uuid)
  status: "PENDING" | "APPROVED" | "REJECTED";
  personName: string;
  grade: string;
  className: string;
  purpose: string | null;
  numberOfUsers: number | null;
  createdAt: string;
  room: {
    name: string;
    number: string;
  };
  slot: {
    startTime: string;
  };
};

export default function AdminHistoryPage() {
  const [reservations, setReservations] = useState<ReservationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントのマウント時に予約履歴を取得
  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservation");
      if (!res.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("不明なエラーが発生しました");
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchReservations();
  }, []);

  // --- ↓ 承認・却下を実行する関数 ---
  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      const res = await fetch(`/api/reservation/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await res.json();
          throw new Error(result.error || "ステータスの更新に失敗しました");
        } else {
          // JSONでない場合は、テキストとしてエラーを読む
          const errorText = await res.text();
          throw new Error(
            `サーバーエラー: ${res.status} ${res.statusText}. Response: ${errorText}`
          );
        }
      }

      toast.success(
        `予約を${status === "APPROVED" ? "承認" : "却下"}しました。`
      );
      fetchReservations(); // データを再取得してリストを更新
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  // このEffectはマウント時に一度だけ実行

  if (isLoading) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">予約承認管理</h1>
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-800 uppercase bg-gray-100"></thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="bg-white border-b">
              {/* 予約日時 */}
              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                {new Date(reservation.createdAt).toLocaleString("ja-JP")}
              </td>
              {/* 所属・氏名 */}
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">
                  {reservation.personName}
                </div>
                <div className="text-xs text-gray-500">
                  {reservation.grade} / {reservation.className}
                </div>
              </td>
              {/* 部屋 */}
              <td className="px-6 py-4">
                <div className="font-medium">{reservation.room.number}</div>
                <div className="text-xs text-gray-500">
                  ({reservation.room.name})
                </div>
              </td>
              {/* 利用日時 */}
              <td className="px-6 py-4 font-semibold whitespace-nowrap">
                {new Date(reservation.slot.startTime).toLocaleString("ja-JP", {
                  timeZone: "UTC",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              {/* 用途・人数 */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant="outline">
                    {reservation.purpose || "---"}
                  </Badge>
                  {reservation.numberOfUsers && (
                    <Badge variant="secondary">
                      {reservation.numberOfUsers}人
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    reservation.status === "APPROVED"
                      ? "default"
                      : reservation.status === "REJECTED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {reservation.status === "PENDING"
                    ? "申請中"
                    : reservation.status === "APPROVED"
                    ? "承認済"
                    : "却下済"}
                </Badge>
              </td>
              <td className="px-6 py-4">
                {reservation.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(reservation.id, "APPROVED")
                      }
                    >
                      承認
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleUpdateStatus(reservation.id, "REJECTED")
                      }
                    >
                      却下
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
