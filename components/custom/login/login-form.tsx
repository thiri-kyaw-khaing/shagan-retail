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
import LanguageSwitcherButton from "@/components/custom/common/language-switcher-button";
import { useTranslation } from "@/lib/i18n/use-translation";
import { authUsers } from "@/lib/types/model/auth-users";

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
  const { t } = useTranslation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);

    // Mocked in place of a real login API call — looks up the account by email and
    // routes by its type. Real check will compare data.password too once there's a backend.
    const user = authUsers.find((authUser) => authUser.email === data.email);

    if (user?.type === "owner") router.push("/owner");
    else if (user?.type === "service_center") router.push("/service-center");
    else router.push("/portal");
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-6">
      <Card className="relative w-full max-w-sm">
        <LanguageSwitcherButton className="absolute top-4 right-4 z-10 bg-slate-100 text-slate-600 hover:bg-slate-200" />

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
                  {t("login.title")}
                </CardTitle>
                <CardDescription className="text-center">
                  {t("login.subtitle")}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-8">
              <div className="flex flex-col gap-6">
                <FormInput
                  control={form.control}
                  path="email"
                  label={t("login.emailLabel")}
                  inputClassName="h-11 text-base sm:text-sm"
                  placeholder={t("login.emailPlaceholder")}
                  type="email"
                />

                <div className="grid gap-2">
                  <FormInput
                    control={form.control}
                    path="password"
                    label={t("login.passwordLabel")}
                    inputClassName="h-11 text-base sm:text-sm"
                    placeholder={t("login.passwordPlaceholder")}
                    type="password"
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      {t("login.forgotPassword")}
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2 px-8">
              <CustomButton
                label={t("login.submit")}
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
