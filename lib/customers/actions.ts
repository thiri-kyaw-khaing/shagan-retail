"use server";

import { mutate } from "@/lib/api/server";

/** 409 if the phone number is already a customer in this org. */
export async function createCustomerAction(values: { name: string; phone: string }) {
  return mutate("/customers", { method: "POST", json: { name: values.name, phone: values.phone } });
}
