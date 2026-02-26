"use client";

import { useState } from "react";

interface Props {
  orderId: string;
  status: "PENDING" | "CONFIRMED" | "PACKING" | "SHIPPED" | "CANCELLED";
}

export function OrderStatusSelect({ orderId, status }: Props) {
  const [value, setValue] = useState(status);

  return (
    <select
      value={value}
      className="rounded border border-[var(--line)] bg-[color:var(--card)] px-2 py-1 text-sm"
      onChange={async (event) => {
        const next = event.target.value as Props["status"];
        setValue(next);

        await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: next }),
        });
      }}
    >
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="PACKING">PACKING</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
