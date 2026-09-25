"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Tag } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import PlaceholderDialog from "@/components/custom/common/back-office/placeholder-dialog";
import CategoryFormDialog, {
  type CategoryFormValues,
} from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import CategoryList from "@/components/custom/common/back-office/product-catalog/category-list";
import ComboTable, {
  isExpired,
} from "@/components/custom/common/back-office/product-catalog/combo-table";
import DeleteCategoryDialog from "@/components/custom/common/back-office/product-catalog/delete-category-dialog";
import DeleteProductDialog from "@/components/custom/common/back-office/product-catalog/delete-product-dialog";
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
import {
  categories as initialCategories,
  type Category,
} from "@/lib/types/model/categories";
import { combos as initialCombos, type Combo } from "@/lib/types/model/combos";
import {
  products as initialProducts,
  type Product,
} from "@/lib/types/model/product";

type CatalogDialog =
  | {
      type: "add-product" | "edit-product" | "delete-product";
      product?: Product;
    }
  | { type: "add-combo" | "edit-combo" | "delete-combo"; combo?: Combo }
  | {
      type: "add-category" | "edit-category" | "delete-category";
      category?: Category;
    }
  | null;

export default function ProductCatalogPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [search, setSearch] = useState("");
  const [productRows, setProductRows] = useState<Product[]>(initialProducts);
  const [comboRows] = useState<Combo[]>(initialCombos);
  // Real categories only — excludes the POS-only "All"/"Combos" filter entries.
  const [categoryRows, setCategoryRows] = useState<Category[]>(
    initialCategories.filter((category) => category.id !== null && category.id !== 4),
  );
  const [dialog, setDialog] = useState<CatalogDialog>(null);
  const categoryFilterForm = useForm<{ category: string }>({
    defaultValues: { category: "all" },
  });
  const categoryFilter = categoryFilterForm.watch("category");

  const categoryFilterOptions = [
    { value: "all", label: "All categories" },
    ...categoryRows.map((category) => ({
      value: String(category.id),
      label: category.label,
    })),
  ];

  const emptyProductForm: ProductFormValues = {
    name: "",
    barcode: "",
    categoryId: categoryRows[0] ? String(categoryRows[0].id) : "",
    modifier: "",
    price: "",
    discount: "0",
    threshold: "",
    tax: "0",
    imageUrl: "",
  };

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
  const isDeleteProductOpen = dialog?.type === "delete-product";
  const isCategoryFormOpen =
    dialog?.type === "add-category" || dialog?.type === "edit-category";
  const isDeleteCategoryOpen = dialog?.type === "delete-category";

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
      : emptyProductForm;

  const categoryFormValues: CategoryFormValues =
    dialog?.type === "edit-category" && dialog.category
      ? { name: dialog.category.label }
      : { name: "" };

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

  const deleteProduct = () => {
    if (dialog?.type !== "delete-product" || !dialog.product) return;

    setProductRows((rows) =>
      rows.filter((product) => product.id !== dialog.product?.id),
    );
    closeDialog();
  };

  const saveCategory = (values: CategoryFormValues) => {
    console.log("Product Catalog - save category:", dialog?.type, values);
    const label = values.name.trim();

    if (dialog?.type === "add-category") {
      setCategoryRows((rows) => [...rows, { id: Date.now(), label, icon: Tag }]);
    } else if (dialog?.type === "edit-category" && dialog.category) {
      setCategoryRows((rows) =>
        rows.map((category) =>
          category.id === dialog.category?.id ? { ...category, label } : category,
        ),
      );
    }

    closeDialog();
  };

  const deleteCategory = () => {
    if (dialog?.type !== "delete-category" || !dialog.category) return;

    setCategoryRows((rows) =>
      rows.filter((category) => category.id !== dialog.category?.id),
    );
    closeDialog();
  };

  const dialogCopy: Record<string, { title: string; description: string }> = {
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

  const isPlaceholderDialogOpen =
    dialog !== null &&
    !isProductFormOpen &&
    !isDeleteProductOpen &&
    !isCategoryFormOpen &&
    !isDeleteCategoryOpen;

  const addLabel = activeTab === "combos" ? "Add combo" : "Add product";

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
                  options={categoryFilterOptions}
                  selectClassName="h-11"
                />
              </div>
            </Form>
          </div>

          <div className="mt-5">
            <ProductTable
              products={filteredProducts}
              categories={categoryRows}
              onEdit={(product) => setDialog({ type: "edit-product", product })}
              onDelete={(product) =>
                setDialog({ type: "delete-product", product })
              }
            />
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {categoryRows.length} categories
            </p>
            <CustomButton
              label="Add Category"
              icon={Plus}
              onClick={() => setDialog({ type: "add-category" })}
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          </div>

          <div className="mt-4">
            <CategoryList
              categories={categoryRows}
              onEdit={(category) => setDialog({ type: "edit-category", category })}
              onDelete={(category) =>
                setDialog({ type: "delete-category", category })
              }
            />
          </div>
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
          categories={categoryRows}
          onClose={closeDialog}
          onSave={saveProduct}
        />
      )}

      <DeleteProductDialog
        product={isDeleteProductOpen ? (dialog.product ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteProduct}
      />

      {isCategoryFormOpen && (
        <CategoryFormDialog
          mode={dialog?.type === "edit-category" ? "edit" : "add"}
          isOpen
          values={categoryFormValues}
          onClose={closeDialog}
          onSave={saveCategory}
        />
      )}

      <DeleteCategoryDialog
        category={isDeleteCategoryOpen ? (dialog.category ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteCategory}
      />

      <PlaceholderDialog
        isOpen={isPlaceholderDialogOpen}
        onClose={closeDialog}
        icon={Plus}
        title={isPlaceholderDialogOpen && dialog ? dialogCopy[dialog.type].title : ""}
        description={
          isPlaceholderDialogOpen && dialog ? dialogCopy[dialog.type].description : ""
        }
      />
    </main>
  );
}
