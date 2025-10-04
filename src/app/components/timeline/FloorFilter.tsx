// app/components/timeline/FloorFilter.tsx
// フロアフィルター部分
"use client";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface FloorFilterProps {
  selectedFloor: string;
  onFloorChange: (floor: string) => void;
}

export function FloorFilter({
  selectedFloor,
  onFloorChange,
}: FloorFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>フロア選択</CardTitle>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          value={selectedFloor}
          onValueChange={(v) => v && onFloorChange(v)}
          className="flex-col w-full"
        >
          <ToggleGroupItem value="all" className="w-full">
            すべて
          </ToggleGroupItem>
          <ToggleGroupItem value="11F" className="w-full">
            11階
          </ToggleGroupItem>
          <ToggleGroupItem value="10F" className="w-full">
            10階
          </ToggleGroupItem>
          <ToggleGroupItem value="other" className="w-full">
            その他
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}
