"use client";

import { Pencil, Trash2 } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import type { Category } from "@/lib/types/model/categories";

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-8 text-center text-sm text-slate-500">
        No categories yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0"
        >
          <span className="font-semibold text-ink">{category.label}</span>
          <div className="flex gap-1">
            <CustomButton
              icon={Pencil}
              aria-label={`Edit ${category.label}`}
              onClick={() => onEdit(category)}
              className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
            />
            <CustomButton
              icon={Trash2}
              aria-label={`Delete ${category.label}`}
              onClick={() => onDelete(category)}
              className="size-10 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
