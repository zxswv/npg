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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";

type ReservationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type ReservationLog = {
  id: string; // idはstring (uuid)
  status: ReservationStatus;
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

// ステータスに応じた表示名を返すヘルパー関数
const getStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">申請中</Badge>;
    case "APPROVED":
      return <Badge>承認済</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">却下済</Badge>;
    case "CANCELLED":
      return <Badge variant="outline">キャンセル済</Badge>;
    default:
      return <Badge variant="outline">不明</Badge>;
  }
};

// 詳細表示用のコンポーネント (ダイアログの中身)
const ReservationDetails = ({
  reservation,
}: {
  reservation: ReservationLog;
}) => {
  // 分かりやすいように日付と時刻を別々にフォーマット
  const usageDate = new Date(reservation.slot.startTime).toLocaleDateString(
    "ja-JP",
    { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }
  );
  const usageTime = new Date(reservation.slot.startTime).toLocaleTimeString(
    "ja-JP",
    { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div className="grid gap-4 py-4 text-sm">
      <div className="grid grid-cols-3 items-center gap-4 pt-4 border-t">
        <Label className="text-right text-gray-500">予約申請日</Label>
        <span className="col-span-2 text-xs text-gray-500">
          {new Date(reservation.createdAt).toLocaleString("ja-JP")}
        </span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">ステータス</Label>
        <div className="col-span-2">{getStatusBadge(reservation.status)}</div>
      </div>
      <div className="grid grid-cols-3 items-center agp-4">
        <Label className="text-right text-gray-500">利用日時</Label>
        <span className="col-span-2 ">{usageDate}</span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">利用時間</Label>
        <span className="col-span-2 font-semibold">{usageTime}</span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">部屋</Label>
        <span className="col-span-2">
          {reservation.room.name} ({reservation.room.number})
        </span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">学年/クラス</Label>
        <span className="col-span-2">
          {reservation.grade} / {reservation.className}
        </span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">代表者名</Label>
        <span className="col-span-2">{reservation.personName}</span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">用途</Label>
        <span className="col-span-2">{reservation.purpose || "---"}</span>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-gray-500">利用人数</Label>
        <span className="col-span-2">
          {reservation.numberOfUsers ? `${reservation.numberOfUsers}人` : "---"}
        </span>
      </div>
      <div className="grid grid-cols-3 items-start gap-4">
        <Label className="text-right text-gray-500">備考</Label>
        <p className="col-span-2 break-words">{reservation.note || "---"}</p>
      </div>
    </div>
  );
};

// スマホ表示用のカードコンポーネント
const ReservationCard = ({ reservation }: { reservation: ReservationLog }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-lg">
            {reservation.room.number} ({reservation.room.name})
          </span>
          <span className="text-sm font-normal text-gray-500">
            {new Date(reservation.slot.startTime).toLocaleString("ja-JP", {
              timeZone: "UTC",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {getStatusBadge(reservation.status)}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-700">
      <p>
        {reservation.grade} / {reservation.className}
      </p>
      <p className="font-semibold">{reservation.personName}</p>
    </CardContent>
    <CardFooter className="flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            詳細
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>予約詳細</DialogTitle>
            <DialogDescription>
              {new Date(reservation.slot.startTime).toLocaleString("ja-JP", {
                timeZone: "UTC",
              })}{" "}
              の予約情報
            </DialogDescription>
          </DialogHeader>
          <ReservationDetails reservation={reservation} />
        </DialogContent>
      </Dialog>
      {(reservation.status === "PENDING" ||
        reservation.status === "APPROVED") && (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => handleCancelReservation(reservation.id)}
        >
          キャンセル
        </Button>
      )}
    </CardFooter>
  </Card>
);

// ----- メインの履歴ページコンポーネント -----
export default function HistoryPage() {
  const [reservations, setReservations] = useState<ReservationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");

  // --- ↓ タブが変更されたらAPIを叩き直すロジック ---
  const fetchReservations = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reservations?status=${status}`);
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

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 text-center">読み込み中...</div>;
    }
    if (error) {
      return (
        <div className="p-8 text-center text-red-600">エラー: {error}</div>
      );
    }
    if (reservations.length === 0) {
      return (
        <div className="p-8 textcenter text-gray-500">
          該当する予約履歴はありません。
        </div>
      );
    }

    const handleCancelReservation = async (id: string) => {
      toast.promise(
        fetch(`/api/reservations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }).then((res) => {
          if (!res.ok) throw new Error("キャンセルに失敗しました");
          return res.json();
        }),
        {
          loading: "キャンセル処理中...",
          success: () => {
            fetchReservations(activeTab); // 現在のタブのリストを再読み込み
            return "予約をキャンセルしました。";
          },
          error: "キャンセル処理に失敗しました。",
        }
      );
    };

    return (
      <>
        {/* PC表示: テーブル */}
        <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-800 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  利用日時
                </th>
                <th scope="col" className="px-6 py-3">
                  部屋
                </th>
                <th scope="col" className="px-6 py-3">
                  所属・氏名
                </th>
                <th scope="col" className="px-6 py-3">
                  ステータス
                </th>
                <th scope="col" className="px-6 py-3">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold whitespace-nowrap">
                    {new Date(r.slot.startTime).toLocaleString("ja-JP", {
                      timeZone: "UTC",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.room.number}</div>
                    <div className="text-xs text-gray-500">({r.room.name})</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {r.personName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.grade} / {r.className}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>予約詳細</DialogTitle>
                          <DialogDescription>
                            {new Date(r.slot.startTime).toLocaleString(
                              "ja-JP",
                              { timeZone: "UTC" }
                            )}{" "}
                            の予約情報
                          </DialogDescription>
                        </DialogHeader>
                        <ReservationDetails reservation={r} />
                      </DialogContent>
                    </Dialog>
                    {(r.status === "PENDING" || r.status === "APPROVED") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleCancelReservation(r.id)}
                      >
                        キャンセル
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* スマホ表示: カード */}
        <div className="md:hidden space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4">
          <TabsTrigger value="ALL">すべて</TabsTrigger>
          <TabsTrigger value="PENDING">申請中</TabsTrigger>
          <TabsTrigger value="APPROVED">承認済</TabsTrigger>
          <TabsTrigger value="REJECTED">却下済</TabsTrigger>
          <TabsTrigger value="CANCELLED">キャンセル済</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>{renderContent()}</TabsContent>
      </Tabs>
    </div>
  );
}
function handleCancelReservation(id: string): void {
  throw new Error("Function not implemented.");
}
