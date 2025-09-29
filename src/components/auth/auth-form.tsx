"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Lock } from "lucide-react";
import Link from "next/link";

export function AuthForm() {
  const [view, setView] = useState<"auth" | "forgot-password">("auth");

  return (
    <div className="w-full max-w-md mx-auto relative">
       <Link href="/" className="absolute -top-12 left-0 text-sm text-primary hover:underline">
          &larr; Volver a la página principal
      </Link>
      {view === "auth" && (
        <Tabs defaultValue="login" className="w-full animate-in fade-in-0 zoom-in-95">
          <Card className="bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                TareaPlus
              </CardTitle>
              <CardDescription>
                Inicia sesión o crea una cuenta para empezar a ganar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onShowForgotPassword={() => setView("forgot-password")} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      )}
      {view === "forgot-password" && (
        <ForgotPasswordForm onBackToLogin={() => setView("auth")} />
      )}
    </div>
  );
}
