"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import ProductTable from "@/components/custom/common/back-office/product-catalog/product-table";
import FormSelect from "@/components/custom/common/forms/form-select";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Form } from "@/components/ui/form";
import type { Category } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";

type ProductsTabProps = {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductsTab({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const filterForm = useForm<{ category: string }>({
    defaultValues: { category: "all" },
  });
  const categoryFilter = useWatch({
    control: filterForm.control,
    name: "category",
  });

  const query = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      query === "" ||
      [product.name, product.barcode].some((value) =>
        value.toLowerCase().includes(query),
      );
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === Number(categoryFilter);
    return matchesQuery && matchesCategory;
  });

  const filterOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.label,
    })),
  ];

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or barcode..."
          className="flex-1 px-0 pt-0"
        />
        <Form {...filterForm}>
          <div className="sm:w-48">
            <FormSelect
              control={filterForm.control}
              path="category"
              options={filterOptions}
              selectClassName="h-11"
            />
          </div>
        </Form>
      </div>

      <div className="mt-5">
        <ProductTable
          products={filteredProducts}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}
