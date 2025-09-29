
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Edit } from "lucide-react";
import { useTransition } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { UserData } from "@/app/dashboard/page";
import { PointsHistory } from "./points-history";

const profileSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." }).max(20, { message: "El nombre de usuario no puede tener más de 20 caracteres." }),
});

type ProfileSectionProps = {
  user: User;
  userData: UserData;
};

export function ProfileSection({ user, userData }: ProfileSectionProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: userData.username,
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (values.username === userData.username) {
        toast({
            title: "Sin cambios",
            description: "El nombre de usuario es el mismo.",
        });
        return;
    }

    startTransition(async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
          username: values.username,
        });

        toast({
          title: "Perfil Actualizado",
          description: "Tu nombre de usuario ha sido cambiado exitosamente.",
        });
      } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
        });
      }
    });
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Mi Perfil</h2>
      
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>Aquí puedes ver y editar la información de tu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Input placeholder="Tu nombre de usuario" {...field} disabled={isPending} />
                        </FormControl>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                            <span className="sr-only">Cambiar nombre</span>
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

           <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Correo Electrónico</h3>
            <p className="text-sm font-semibold">{user.email}</p>
           </div>

        </CardContent>
      </Card>

      <PointsHistory userId={user.uid} />

    </section>
  );
}
