// app/components/timeline/DateSelector.tsx
// カレンダー部分
"use client";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>日付選択</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
