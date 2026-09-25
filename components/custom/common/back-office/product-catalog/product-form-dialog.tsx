"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus } from "lucide-react";

import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { categories } from "@/lib/types/model/categories";
import { cn } from "@/lib/utils";

export type ProductFormValues = {
  name: string;
  barcode: string;
  categoryId: string;
  modifier: string;
  price: string;
  discount: string;
  threshold: string;
  tax: string;
  imageUrl: string;
};

type ProductFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: ProductFormValues;
  onClose: () => void;
  onSave: (values: ProductFormValues) => void;
};

const CATEGORY_OPTIONS = categories
  .filter((category) => category.id !== null && category.id !== 4)
  .map((category) => ({ value: String(category.id), label: category.label }));

const LABEL_CLASS = "text-sm font-semibold uppercase tracking-wide text-slate-500";
const INPUT_CLASS =
  "mt-2 h-11 border-rose-200 text-base font-normal normal-case tracking-normal text-ink";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ProductPhotoField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError("Use a JPG, PNG or WebP file.");
      console.log(
        "Product Catalog - rejected product photo (unsupported type):",
        file.type,
      );
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("File is larger than 5MB.");
      console.log(
        "Product Catalog - rejected product photo (too large):",
        file.size,
      );
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setError(null);
    console.log("Product Catalog - product photo selected:", file.name, file.size);
    onChange(url);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative flex min-h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-rose-200 text-center hover:bg-rose-50/50"
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable Next.js asset */}
            <img
              src={value}
              alt="Product preview"
              className="absolute inset-0 size-full object-cover"
            />
            <span className="relative rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              Change photo
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-8 text-rose-300" />
            <span className="font-semibold text-ink">Add product photo</span>
            <span className="text-xs text-ink-muted">JPG, PNG or WebP · max 5MB</span>
          </>
        )}
      </button>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}

export default function ProductFormDialog({
  mode,
  isOpen,
  values,
  onClose,
  onSave,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({ defaultValues: values });
  const canSubmit =
    mode === "edit" ||
    (form.watch("name").trim().length > 0 && form.watch("barcode").trim().length > 0);

  useEffect(() => {
    if (isOpen) form.reset(values);
  }, [form, isOpen, values]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {mode === "add" ? "Add product" : "Edit product"}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            {mode === "add"
              ? "Add a new product to your catalog."
              : "Update this product's information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ProductPhotoField
                value={form.watch("imageUrl")}
                onChange={(url) => form.setValue("imageUrl", url, { shouldDirty: true })}
              />

              <div className="flex flex-col gap-5">
                <FormInput
                  control={form.control}
                  path="name"
                  label="Product name"
                  placeholder="e.g. Jasmine Rice 5kg"
                  className={LABEL_CLASS}
                  inputClassName={INPUT_CLASS}
                />
                <FormInput
                  control={form.control}
                  path="barcode"
                  label="Barcode"
                  placeholder="e.g. SRF-0017"
                  className={LABEL_CLASS}
                  inputClassName={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                path="categoryId"
                label="Category"
                options={CATEGORY_OPTIONS}
                className={LABEL_CLASS}
                selectClassName="mt-2 h-11"
              />
              <FormInput
                control={form.control}
                path="modifier"
                label="Modifier (weight/size)"
                placeholder="e.g. 5kg, 500ml, Large"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                control={form.control}
                path="price"
                type="number"
                label="Sell price (K)"
                placeholder="0"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
              <FormInput
                control={form.control}
                path="discount"
                type="number"
                label="Discount (%)"
                placeholder="0"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                control={form.control}
                path="threshold"
                type="number"
                label="Low stock alert"
                placeholder="10"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
              <FormInput
                control={form.control}
                path="tax"
                type="number"
                label="Tax (%)"
                placeholder="0"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
            </div>

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label="Save product"
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "min-h-12 px-5 font-semibold text-white",
                  canSubmit ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
                )}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
