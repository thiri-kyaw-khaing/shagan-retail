"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import Logo from "../logo/logo";
import FormInput from "../common/forms/form-input";
import CustomButton from "../common/custom-button";

const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
    router.push("/portal");
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <CardHeader>
              <div className="mb-4 flex items-center justify-center">
                <Logo icon={<Store color="white" />} />
              </div>
              <div className="flex flex-col items-center">
                <CardTitle className="mb-2 text-center text-xl font-bold sm:text-2xl">
                  Shagan Retail
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your email below to login to your account
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-8">
              <div className="flex flex-col gap-6">
                <FormInput
                  control={form.control}
                  path="email"
                  label="Email"
                  inputClassName="h-11 text-base sm:text-sm"
                  placeholder="Enter your email"
                  type="email"
                />

                <div className="grid gap-2">
                  <FormInput
                    control={form.control}
                    path="password"
                    label="Password"
                    inputClassName="h-11 text-base sm:text-sm"
                    placeholder="Enter your password"
                    type="password"
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2 px-8">
              <CustomButton
                label="Login"
                type="submit"
                className="h-11 w-full bg-brand hover:bg-brand/90 text-base sm:text-sm"
              />
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default LoginForm;
