"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import PlaceholderDialog from "@/components/custom/common/back-office/placeholder-dialog";
import ComboTable, {
  isExpired,
} from "@/components/custom/common/back-office/product-catalog/combo-table";
import ProductFormDialog, {
  type ProductFormValues,
} from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import ProductTable from "@/components/custom/common/back-office/product-catalog/product-table";
import ProductTabs, {
  type ProductTab,
} from "@/components/custom/common/back-office/product-catalog/product-tabs";
import CustomButton from "@/components/custom/common/custom-button";
import FormSelect from "@/components/custom/common/forms/form-select";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Form } from "@/components/ui/form";
import { categories } from "@/lib/types/model/categories";
import { combos as initialCombos, type Combo } from "@/lib/types/model/combos";
import {
  products as initialProducts,
  type Product,
} from "@/lib/types/model/product";

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  ...categories
    .filter((category) => category.id !== null && category.id !== 4)
    .map((category) => ({ value: String(category.id), label: category.label })),
];

const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  barcode: "",
  categoryId: String(categories.find((category) => category.id !== null)?.id ?? ""),
  modifier: "",
  price: "",
  discount: "0",
  threshold: "",
  tax: "0",
  imageUrl: "",
};

type CatalogDialog =
  | {
      type: "add-product" | "edit-product" | "delete-product";
      product?: Product;
    }
  | { type: "add-combo" | "edit-combo" | "delete-combo"; combo?: Combo }
  | null;

export default function ProductCatalogPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [search, setSearch] = useState("");
  const [productRows, setProductRows] = useState<Product[]>(initialProducts);
  const [comboRows] = useState<Combo[]>(initialCombos);
  const [dialog, setDialog] = useState<CatalogDialog>(null);
  const categoryFilterForm = useForm<{ category: string }>({
    defaultValues: { category: "all" },
  });
  const categoryFilter = categoryFilterForm.watch("category");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return productRows.filter((product) => {
      const matchesQuery =
        query === "" ||
        [product.name, product.barcode].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === Number(categoryFilter);
      return matchesQuery && matchesCategory;
    });
  }, [search, categoryFilter, productRows]);

  const expiredComboCount = useMemo(
    () => comboRows.filter(isExpired).length,
    [comboRows],
  );

  const closeDialog = () => setDialog(null);

  const isProductFormOpen =
    dialog?.type === "add-product" || dialog?.type === "edit-product";
  const productFormValues: ProductFormValues =
    dialog?.type === "edit-product" && dialog.product
      ? {
          name: dialog.product.name,
          barcode: dialog.product.barcode,
          categoryId: String(dialog.product.categoryId),
          modifier: dialog.product.modifier ?? "",
          price: String(dialog.product.price),
          discount: String(dialog.product.discount),
          threshold: String(dialog.product.threshold),
          tax: String(dialog.product.tax),
          imageUrl: dialog.product.imageUrl,
        }
      : EMPTY_PRODUCT_FORM;

  const saveProduct = (values: ProductFormValues) => {
    console.log("Product Catalog - save product:", dialog?.type, values);

    const parsed = {
      name: values.name.trim(),
      barcode: values.barcode.trim(),
      categoryId: Number(values.categoryId),
      modifier: values.modifier.trim() || undefined,
      price: Number(values.price) || 0,
      discount: Number(values.discount) || 0,
      threshold: Number(values.threshold) || 0,
      tax: Number(values.tax) || 0,
      imageUrl: values.imageUrl,
    };

    if (dialog?.type === "add-product") {
      setProductRows((rows) => [
        ...rows,
        {
          id: Date.now(),
          stock: 0,
          isActive: true,
          ...parsed,
        },
      ]);
    } else if (dialog?.type === "edit-product" && dialog.product) {
      setProductRows((rows) =>
        rows.map((product) =>
          product.id === dialog.product?.id ? { ...product, ...parsed } : product,
        ),
      );
    }

    closeDialog();
  };

  const dialogCopy: Record<string, { title: string; description: string }> = {
    "delete-product": {
      title: `Delete ${dialog?.type === "delete-product" ? dialog.product?.name : "product"}`,
      description:
        "Deleting products isn't wired up yet — this is a placeholder.",
    },
    "add-combo": {
      title: "Add combo",
      description: "Combo creation isn't wired up yet — this is a placeholder.",
    },
    "edit-combo": {
      title: `Edit ${dialog?.type === "edit-combo" ? dialog.combo?.name : "combo"}`,
      description: "Editing combos isn't wired up yet — this is a placeholder.",
    },
    "delete-combo": {
      title: `Delete ${dialog?.type === "delete-combo" ? dialog.combo?.name : "combo"}`,
      description:
        "Deleting combos isn't wired up yet — this is a placeholder.",
    },
  };

  const addLabel =
    activeTab === "combos"
      ? "Add combo"
      : activeTab === "categories"
        ? "Add category"
        : "Add product";

  const handleAdd = () => {
    if (activeTab === "combos") setDialog({ type: "add-combo" });
    else if (activeTab === "products") setDialog({ type: "add-product" });
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${productRows.length} products · ${comboRows.length} combos (${expiredComboCount} expired)`}
        backHref="/manager"
        action={
          activeTab !== "categories" ? (
            <CustomButton
              label={addLabel}
              icon={Plus}
              onClick={handleAdd}
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          ) : undefined
        }
      />

      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "products" && (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name or barcode..."
              className="flex-1 px-0 pt-0"
            />
            <Form {...categoryFilterForm}>
              <div className="sm:w-48">
                <FormSelect
                  control={categoryFilterForm.control}
                  path="category"
                  options={CATEGORY_FILTER_OPTIONS}
                  selectClassName="h-11"
                />
              </div>
            </Form>
          </div>

          <div className="mt-5">
            <ProductTable
              products={filteredProducts}
              onEdit={(product) => setDialog({ type: "edit-product", product })}
              onDelete={(product) =>
                setDialog({ type: "delete-product", product })
              }
            />
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-white p-8 text-center text-sm text-slate-500">
          Category management is coming soon.
        </div>
      )}

      {activeTab === "combos" && (
        <div className="mt-5">
          <ComboTable
            combos={comboRows}
            onEdit={(combo) => setDialog({ type: "edit-combo", combo })}
            onDelete={(combo) => setDialog({ type: "delete-combo", combo })}
          />
        </div>
      )}

      {isProductFormOpen && (
        <ProductFormDialog
          mode={dialog?.type === "edit-product" ? "edit" : "add"}
          isOpen
          values={productFormValues}
          onClose={closeDialog}
          onSave={saveProduct}
        />
      )}

      <PlaceholderDialog
        isOpen={dialog !== null && !isProductFormOpen}
        onClose={closeDialog}
        icon={Plus}
        title={dialog && !isProductFormOpen ? dialogCopy[dialog.type].title : ""}
        description={
          dialog && !isProductFormOpen ? dialogCopy[dialog.type].description : ""
        }
      />
    </main>
  );
}
