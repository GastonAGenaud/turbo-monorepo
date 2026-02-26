"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label, Textarea } from "@ggseeds/ui";

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  product?: {
    id: string;
    sku: string;
    slug: string;
    name: string;
    brand: string | null;
    description: string | null;
    basePrice: number;
    markupPercent: number;
    stock: number | null;
    stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
    categoryId: string | null;
    images: string[];
    source: "MANUAL" | "MERLINGROW" | "DUTCHPASSION";
    tags: string[];
    isActive: boolean;
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(product?.id);

  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        setLoading(true);
        setError(null);

        const payload = {
          sku: String(formData.get("sku") ?? ""),
          slug: String(formData.get("slug") ?? ""),
          name: String(formData.get("name") ?? ""),
          brand: String(formData.get("brand") ?? "") || null,
          description: String(formData.get("description") ?? "") || null,
          images: String(formData.get("images") ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          basePrice: Number(formData.get("basePrice") ?? 0),
          markupPercent: Number(formData.get("markupPercent") ?? 15),
          stock: String(formData.get("stock") ?? "") ? Number(formData.get("stock")) : null,
          stockStatus: String(formData.get("stockStatus") ?? "UNKNOWN"),
          categoryId: String(formData.get("categoryId") ?? "") || null,
          tags: String(formData.get("tags") ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          isActive: formData.get("isActive") === "on",
          source: String(formData.get("source") ?? "MANUAL"),
        };

        const response = await fetch(isEdit ? `/api/admin/products/${product?.id}` : "/api/admin/products", {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setLoading(false);

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setError(body?.error ?? "No se pudo guardar");
          return;
        }

        router.push("/productos");
        router.refresh();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} required />
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
        </div>
        <div>
          <Label htmlFor="basePrice">Precio base</Label>
          <Input id="basePrice" name="basePrice" type="number" defaultValue={product?.basePrice ?? 0} required />
        </div>
        <div>
          <Label htmlFor="markupPercent">Markup %</Label>
          <Input
            id="markupPercent"
            name="markupPercent"
            type="number"
            defaultValue={product?.markupPercent ?? 15}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? ""} />
        </div>
        <div>
          <Label htmlFor="stockStatus">Estado de stock</Label>
          <select id="stockStatus" name="stockStatus" defaultValue={product?.stockStatus ?? "UNKNOWN"} className="h-10 w-full rounded-md border border-[var(--line)] bg-[color:var(--card)] px-3">
            <option value="IN_STOCK">IN_STOCK</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>
        <div>
          <Label htmlFor="categoryId">Categoría</Label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} className="h-10 w-full rounded-md border border-[var(--line)] bg-[color:var(--card)] px-3">
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="source">Fuente</Label>
          <select
            id="source"
            name="source"
            defaultValue={product?.source ?? "MANUAL"}
            className="h-10 w-full rounded-md border border-[var(--line)] bg-[color:var(--card)] px-3"
          >
            <option value="MANUAL">MANUAL</option>
            <option value="MERLINGROW">MERLINGROW</option>
            <option value="DUTCHPASSION">DUTCHPASSION</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="images">Imágenes (URLs separadas por coma)</Label>
        <Input id="images" name="images" defaultValue={product?.images.join(", ") ?? ""} />
      </div>

      <div>
        <Label htmlFor="tags">Tags (separadas por coma)</Label>
        <Input id="tags" name="tags" defaultValue={product?.tags.join(", ") ?? ""} />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Activo
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : isEdit ? "Actualizar producto" : "Crear producto"}
      </Button>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
