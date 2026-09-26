"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import CategoryFormDialog from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import CategoryList from "@/components/custom/common/back-office/product-catalog/category-list";
import ComboFormDialog from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import ComboTable from "@/components/custom/common/back-office/product-catalog/combo-table";
import DeleteCategoryDialog from "@/components/custom/common/back-office/product-catalog/delete-category-dialog";
import DeleteComboDialog from "@/components/custom/common/back-office/product-catalog/delete-combo-dialog";
import DeleteProductDialog from "@/components/custom/common/back-office/product-catalog/delete-product-dialog";
import ProductFormDialog from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import ProductTable from "@/components/custom/common/back-office/product-catalog/product-table";
import ProductTabs, {
  type ProductTab,
} from "@/components/custom/common/back-office/product-catalog/product-tabs";
import CustomButton from "@/components/custom/common/custom-button";
import FormSelect from "@/components/custom/common/forms/form-select";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Form } from "@/components/ui/form";
import { useCategoryCrud } from "@/lib/hooks/use-category-crud";
import { useComboCrud } from "@/lib/hooks/use-combo-crud";
import { useProductCrud } from "@/lib/hooks/use-product-crud";

export default function ProductCatalogPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<CatalogDialog>(null);
  const closeDialog = () => setDialog(null);

  const categoryFilterForm = useForm<{ category: string }>({
    defaultValues: { category: "all" },
  });
  const categoryFilter = categoryFilterForm.watch("category");

  const categories = useCategoryCrud(dialog, closeDialog);
  const products = useProductCrud(
    dialog,
    closeDialog,
    categories.rows,
    search,
    categoryFilter,
  );
  const combos = useComboCrud(dialog, closeDialog);

  const addLabel = activeTab === "combos" ? "Add combo" : "Add product";
  const handleAdd = () => {
    if (activeTab === "combos") setDialog({ type: "add-combo" });
    else if (activeTab === "products") setDialog({ type: "add-product" });
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products.rows.length} products · ${combos.rows.length} combos (${combos.expiredCount} expired)`}
        backHref="/owner"
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
                  options={categories.filterOptions}
                  selectClassName="h-11"
                />
              </div>
            </Form>
          </div>

          <div className="mt-5">
            <ProductTable
              products={products.filteredRows}
              categories={categories.rows}
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
              {categories.rows.length} categories
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
              categories={categories.rows}
              onEdit={(category) =>
                setDialog({ type: "edit-category", category })
              }
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
            combos={combos.rows}
            products={products.rows}
            onEdit={(combo) => setDialog({ type: "edit-combo", combo })}
            onDelete={(combo) => setDialog({ type: "delete-combo", combo })}
          />
        </div>
      )}

      {products.isFormOpen && (
        <ProductFormDialog
          mode={dialog?.type === "edit-product" ? "edit" : "add"}
          isOpen
          values={products.formValues}
          categories={categories.rows}
          onClose={closeDialog}
          onSave={products.save}
        />
      )}

      <DeleteProductDialog
        product={
          products.isDeleteOpen && dialog?.type === "delete-product"
            ? (dialog.product ?? null)
            : null
        }
        onClose={closeDialog}
        onConfirm={products.remove}
      />

      {categories.isFormOpen && (
        <CategoryFormDialog
          mode={dialog?.type === "edit-category" ? "edit" : "add"}
          isOpen
          values={categories.formValues}
          onClose={closeDialog}
          onSave={categories.save}
        />
      )}

      <DeleteCategoryDialog
        category={
          categories.isDeleteOpen && dialog?.type === "delete-category"
            ? (dialog.category ?? null)
            : null
        }
        onClose={closeDialog}
        onConfirm={categories.remove}
      />

      {combos.isFormOpen && (
        <ComboFormDialog
          mode={dialog?.type === "edit-combo" ? "edit" : "add"}
          isOpen
          values={combos.formValues}
          items={combos.formItems}
          products={products.rows}
          onClose={closeDialog}
          onSave={combos.save}
        />
      )}

      <DeleteComboDialog
        combo={
          combos.isDeleteOpen && dialog?.type === "delete-combo"
            ? (dialog.combo ?? null)
            : null
        }
        onClose={closeDialog}
        onConfirm={combos.remove}
      />
    </main>
  );
}
