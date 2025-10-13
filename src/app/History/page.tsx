// app/history/page.tsx
// ログページ
"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "../components/ui/label";

type ReservationLog = {
  id: string; // idはstring (uuid)
  status: "PENDING" | "APPROVED" | "REJECTED";
  personName: string;
  grade: string;
  className: string;
  purpose: string | null;
  numberOfUsers: number | null;
  note: string | null;
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
  const [activeTab, setActiveTab] = useState("ALL");

  // --- ↓ タブが変更されたらAPIを叩き直すロジック ---
  const fetchReservations = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reservation?status=${status}`);
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("不明なエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(activeTab);
  }, [activeTab, fetchReservations]);

  if (isLoading) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">エラー: {error}</div>;
  }

  // ステータスの表示名を返すヘルパー関数
  const getStatusBadge = (status: ReservationLog["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">申請中</Badge>;
      case "APPROVED":
        return <Badge>承認済</Badge>;
      case "REJECTED": // REJECTEDはDBから削除されるので、このケースは通常表示されない
        return <Badge variant="destructive">却下/キャンセル済</Badge>;
      default:
        return <Badge variant="outline">不明</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
      {/* フィルター機能 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="ALL">すべて</TabsTrigger>
          <TabsTrigger value="PENDING">申請中 (仮予約)</TabsTrigger>
          <TabsTrigger value="APPROVED">承認済 (本予約)</TabsTrigger>
          <TabsTrigger value="REJECTED">キャンセル済 (仮予約)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="p-8 text-center">読み込み中...</div>
          ) : (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      予約日時
                    </th>
                    <th scope="col" className="px-6 py-3">
                      利用日時
                    </th>
                    <th scope="col" className="px-6 py-3">
                      所属・氏名
                    </th>
                    <th scope="col" className="px-6 py-3">
                      部屋
                    </th>
                    <th scope="col" className="px-6 py-3">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3">
                      用途・人数
                    </th>{" "}
                    {/* 詳細ボタン用の列 */}
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
                          {new Date(reservation.createdAt).toLocaleString(
                            "ja-JP"
                          )}
                        </td>
                        {/* 利用日時 */}
                        <td className="px-6 py-4 font-semibold whitespace-nowrap">
                          {new Date(reservation.slot.startTime).toLocaleString(
                            "ja-JP",
                            {
                              timeZone: "UTC",
                              // year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                          <div className="font-medium">
                            {reservation.room.number}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({reservation.room.name})
                          </div>
                        </td>
                        {/* ステータス */}
                        <td className="px-6 py-4">
                          {getStatusBadge(reservation.status)}
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

                        {/* --- ↓ 詳細確認ダイアログ --- */}
                        <td className="px-6 py-4 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                詳細
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>予約詳細</DialogTitle>
                                <DialogDescription>
                                  {new Date(
                                    reservation.slot.startTime
                                  ).toLocaleString("ja-JP", {
                                    timeZone: "UTC",
                                  })}{" "}
                                  の予約情報
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4 text-sm">
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    ステータス
                                  </Label>
                                  <div className="col-span-2">
                                    {getStatusBadge(reservation.status)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    部屋
                                  </Label>
                                  <span className="col-span-2">
                                    {reservation.room.name} (
                                    {reservation.room.number})
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    学年/クラス
                                  </Label>
                                  <span className="col-span-2">
                                    {reservation.grade} /{" "}
                                    {reservation.className}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    代表者名
                                  </Label>
                                  <span className="col-span-2">
                                    {reservation.personName}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    用途
                                  </Label>
                                  <span className="col-span-2">
                                    {reservation.purpose || "---"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label className="text-right text-gray-500">
                                    利用人数
                                  </Label>
                                  <span className="col-span-2">
                                    {reservation.numberOfUsers
                                      ? `${reservation.numberOfUsers}人`
                                      : "---"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 items-start gap-4">
                                  <Label className="text-right text-gray-500">
                                    備考
                                  </Label>
                                  <p className="col-span-2">
                                    {reservation.note || "---"}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        該当する予約履歴はありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
