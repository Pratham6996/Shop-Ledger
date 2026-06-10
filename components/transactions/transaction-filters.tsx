"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { TransactionFilters } from "@/lib/types";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ filters, onChange }: TransactionFiltersProps) {
  const hasFilters =
    filters.search || (filters.direction && filters.direction !== "all") || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="flex-1 min-w-[180px]">
        <Input
          placeholder="Search by counterparty…"
          value={filters.search ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Select
        value={filters.direction ?? "all"}
        onValueChange={(v: string | null) => v && onChange({ ...filters, direction: v as TransactionFilters["direction"] })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All directions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Directions</SelectItem>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, dateFrom: e.target.value })}
          className="w-[145px]"
          placeholder="From"
        />
        <span className="text-gray-400 text-sm">–</span>
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, dateTo: e.target.value })}
          className="w-[145px]"
          placeholder="To"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ direction: "all" })}
          className="text-gray-500 gap-1"
        >
          <X className="w-3 h-3" /> Clear
        </Button>
      )}
    </div>
  );
}
