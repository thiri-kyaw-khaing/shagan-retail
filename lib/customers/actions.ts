"use server";

import { mutate } from "@/lib/api/server";
import type { ApiCustomer } from "@/lib/api/types";

/** 409 if the phone number is already a customer in this org. Returns the new customer. */
export async function createCustomerAction(values: { name: string; phone: string }) {
  return mutate<ApiCustomer>("/customers", {
    method: "POST",
    json: { name: values.name.trim(), phone: values.phone.trim() },
  });
}
