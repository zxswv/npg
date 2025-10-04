"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/components/ui/badge";

type ReservationLog = {
  id: string; // idはstring (uuid)
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

export default function HistoryPage() {
  const [reservations, setReservations] = useState<ReservationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントのマウント時に予約履歴を取得
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch("/api/reservations");
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

    fetchReservations();
  }, []); // このEffectはマウント時に一度だけ実行

  if (isLoading) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-800 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                予約日時
              </th>
              <th scope="col" className="px-6 py-3">
                所属・氏名
              </th>
              <th scope="col" className="px-6 py-3">
                部屋
              </th>
              <th scope="col" className="px-6 py-3">
                利用日時
              </th>
              <th scope="col" className="px-6 py-3">
                用途・人数
              </th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
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
                    {new Date(reservation.slot.startTime).toLocaleString(
                      "ja-JP",
                      {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  予約履歴はありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
