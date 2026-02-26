"use client";

import { useState } from "react";

import { Button, Input, Label } from "@ggseeds/ui";

interface ProfileFormProps {
  defaultValues: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        setLoading(true);
        setMessage(null);

        const payload = {
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          addressLine1: String(formData.get("addressLine1") ?? ""),
          addressLine2: String(formData.get("addressLine2") ?? ""),
          city: String(formData.get("city") ?? ""),
          postalCode: String(formData.get("postalCode") ?? ""),
        };

        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setLoading(false);
        setMessage(response.ok ? "Perfil actualizado" : "No se pudo actualizar");
      }}
    >
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={defaultValues.name} required />
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={defaultValues.phone} />
      </div>
      <div>
        <Label htmlFor="addressLine1">Dirección</Label>
        <Input id="addressLine1" name="addressLine1" defaultValue={defaultValues.addressLine1} />
      </div>
      <div>
        <Label htmlFor="addressLine2">Depto/Piso</Label>
        <Input id="addressLine2" name="addressLine2" defaultValue={defaultValues.addressLine2} />
      </div>
      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" defaultValue={defaultValues.city} />
      </div>
      <div>
        <Label htmlFor="postalCode">Código postal</Label>
        <Input id="postalCode" name="postalCode" defaultValue={defaultValues.postalCode} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>

      {message ? <p className="text-sm text-[color:var(--muted)]">{message}</p> : null}
    </form>
  );
}
