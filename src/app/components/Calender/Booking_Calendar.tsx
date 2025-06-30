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

export default function BookingCalendar() {
  const [dropdown, setDropdown] =
    React.useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown"
    );
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <div className="flex flex-col gap-4 items-center justify-center p-4">
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        captionLayout={dropdown}
        className="rounded-lg border shadow-sm w-[500px] h-[500px] text-lg"
      />
      <div className="flex flex-col gap-3">
        <Label htmlFor="dropdown" className="px-1">
          Dropdown
        </Label>
        <Select
          value={dropdown}
          onValueChange={(value) =>
            setDropdown(
              value as React.ComponentProps<typeof Calendar>["captionLayout"]
            )
          }
        >
          <SelectTrigger
            id="dropdown"
            size="sm"
            className="bg-background w-full"
          >
            <SelectValue placeholder="Dropdown" />
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="dropdown">月と年</SelectItem>
            <SelectItem value="dropdown-months">月のみ</SelectItem>
            <SelectItem value="dropdown-years">年のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
