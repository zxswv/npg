"use client";

import React, { useState } from "react";
import BookingCalendar from "@/app/components/Calender/Booking_Calendar"; // カレンダーコンポーネント
import NewSchedulePage from "@/app/components/schedule/new/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function ReservationsPage() {
  // 親ページで日付の状態を一元管理します。
  // 初期値を new Date() にすることで、今日の日付がデフォルトになります。
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">新規予約</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: カレンダー */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>日付を選択</CardTitle>
            <CardDescription>
              予約したい日付をクリックしてください。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <BookingCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* 右側: 予約フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>予約情報を入力</CardTitle>
            <CardDescription>
              {selectedDate
                ? `${selectedDate.toLocaleDateString("ja-JP")} の予約`
                : "まず日付を選択してください"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewSchedulePage
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
