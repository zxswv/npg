// app/timeline/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { ReservationTimeline } from "@/app/components/ReservationTimeline/ReservationTimeline"; // 次に作成するコンポーネント

// APIから返されるデータの型
export type RoomWithReservations = {
  id: number;
  name: string;
  reservations: {
    id: string;
    personName: string;
    slot: {
      startTime: string;
    };
  }[];
};

export default function TimelinePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timelineData, setTimelineData] = useState<RoomWithReservations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 日付が変更されたらAPIを叩いてデータを再取得
  useEffect(() => {
    if (!date) return;

    const fetchTimelineData = async () => {
      setIsLoading(true);
      // Dateオブジェクトを "YYYY-MM-DD" 形式の文字列に変換
      const dateString = date.toISOString().split("T")[0];
      const res = await fetch(`/api/timeline?date=${dateString}`);
      const data = await res.json();
      setTimelineData(data);
      setIsLoading(false);
    };

    fetchTimelineData();
  }, [date]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">予約状況タイムライン</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 左側: カレンダー */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>日付選択</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* 右側: タイムライン */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? date.toLocaleDateString("ja-JP") : "日付を選択"}
              </CardTitle>
              <CardDescription>
                各部屋の時間帯ごとの予約状況です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : (
                <ReservationTimeline data={timelineData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
