"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { doc, setDoc, getDocs, collection, query, where, writeBatch } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const formSchema = z
  .object({
    username: z.string().min(3, {
      message: "El nombre de usuario debe tener al menos 3 caracteres.",
    }),
    email: z.string().email({
      message: "Por favor, introduce una dirección de correo electrónico válida.",
    }),
    password: z.string().min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    }),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

// Function to generate a random referral code
const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

async function isReferralCodeValid(code: string): Promise<{valid: boolean, referrerId: string | null}> {
    if (!code) return {valid: false, referrerId: null};
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("referralCode", "==", code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return {valid: false, referrerId: null};
    }
    const referrerDoc = querySnapshot.docs[0];
    return {valid: true, referrerId: referrerDoc.id};
}

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: refCode || "",
    },
  });

  useEffect(() => {
    if (refCode) {
      form.setValue('referralCode', refCode);
    }
  }, [refCode, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        let referrerId: string | null = null;
        let usedReferralCode: string | undefined = undefined;
        if (values.referralCode) {
            const referralCheck = await isReferralCodeValid(values.referralCode);
            if (!referralCheck.valid) {
                toast({
                    variant: "destructive",
                    title: "Código Inválido",
                    description: "El código de referido que introdujiste no es válido.",
                });
                return;
            }
            referrerId = referralCheck.referrerId;
            usedReferralCode = values.referralCode;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        const batch = writeBatch(firestore);

        const newUserRef = doc(firestore, "users", user.uid);
        batch.set(newUserRef, {
            uid: user.uid,
            email: user.email,
            username: values.username,
            createdAt: new Date(),
            role: 'user',
            points: 0,
            referrals: 0,
            referralCode: generateReferralCode(),
            completedTasks: [],
            referredByCode: usedReferralCode
        });

        if (referrerId) {
            const referralRef = doc(collection(firestore, "referrals"));
            batch.set(referralRef, {
                referrerId: referrerId,
                referredId: user.uid,
                createdAt: new Date()
            });
        }

        await batch.commit();
        
        toast({
          title: "¡Cuenta creada!",
          description: "Hemos creado tu cuenta exitosamente.",
        });
         router.push('/dashboard');
      } catch (error: any) {
        let message = "Ocurrió un error inesperado.";
        if (error.code === 'auth/email-already-in-use') {
          message = "Este correo electrónico ya está en uso.";
        }
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: message,
        });
      }
    });
  }

  return (
    <div className="space-y-6 pt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="tu-usuario" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="tu@email.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isPending}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isPending}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Referido (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="CÓDIGO123" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Cuenta
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">O regístrate con</span>
        </div>
      </div>
      <GoogleButton />
    </div>
  );
}
