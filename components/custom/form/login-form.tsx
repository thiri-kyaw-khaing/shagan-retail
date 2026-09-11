"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Store } from "lucide-react";
import Logo from "../logo/logo";

function LoginForm() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-sm">
        <form className="flex flex-col gap-6">
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
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                  className="h-11 text-base sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 text-base sm:text-sm"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2 px-8">
            <Button
              asChild
              className="h-11 w-full bg-brand hover:bg-brand/90 text-base sm:text-sm"
            >
              <Link href="/portal">Sign in</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default LoginForm;
