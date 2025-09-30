"use client";

// import { useState } from "react";
// import { Input } from "@/app/components/ui/input";
import { Calendar } from "@/app/components/ui/calendar";
import { Label } from "@/app/components/ui/label";
// import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import React from "react";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export default function BookingCalendar({
  selectedDate,
  onDateChange,
}: BookingCalendarProps) {
  // このコンポーネント自身のstateは不要になったので削除

  return (
    // カレンダーのサイズを少し調整
    <Calendar
      mode="single"
      selected={selectedDate} // 親から渡された日付を表示
      onSelect={onDateChange} // 親の更新関数を呼び出す
      className="bg-background w-full"
    />
  );
}
