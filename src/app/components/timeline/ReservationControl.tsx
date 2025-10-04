// app/components/timeline/ReservationControl.tsx
// 予約実行ボタン部分

"use client";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { SelectedSlot } from "@/app/timeline/page"; // 親ページの型をインポート

interface ReservationControlProps {
  selectedSlots: Map<string, SelectedSlot>;
  onOpenDialog: () => void;
}

export function ReservationControl({
  selectedSlots,
  onOpenDialog,
}: ReservationControlProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>予約実行</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          選択中の部屋: {selectedSlots.size}件
        </p>
        <Button onClick={onOpenDialog} className="w-full">
          選択した部屋を予約する
        </Button>
      </CardContent>
    </Card>
  );
}
