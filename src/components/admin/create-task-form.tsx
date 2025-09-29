
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

const taskSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres." }),
  type: z.enum(["visit", "follow", "shortener", "video"]),
  url: z.string().url({ message: "Por favor, introduce una URL válida." }),
  duration: z.coerce.number().optional(),
  points: z.coerce.number().min(1, { message: "Los puntos deben ser al menos 1." }),
  repeatable: z.boolean().default(false),
  repeatIntervalHours: z.coerce.number().optional(),
});

export function CreateTaskForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      url: "",
      points: 100,
      repeatable: false,
    },
  });

  const taskType = form.watch("type");
  const isRepeatable = form.watch("repeatable");

  async function onSubmit(values: z.infer<typeof taskSchema>) {
    startTransition(async () => {
      try {
        await addDoc(collection(firestore, "tasks"), {
          ...values,
          completions: 0,
          status: 'active',
          createdAt: serverTimestamp(),
        });

        toast({
          title: "Tarea Publicada",
          description: "La nueva tarea está ahora disponible para los usuarios.",
        });
        form.reset();
        form.setValue('points', 100);
        form.setValue('repeatable', false);
      } catch (error) {
        console.error("Error creating task: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear la tarea. Inténtalo de nuevo.",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Tarea</CardTitle>
        <CardDescription>Completa el formulario para publicar una nueva tarea para los usuarios.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Tarea</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sigue a @usuario en Instagram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Tarea</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de tarea" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visit">Visitar Página</SelectItem>
                      <SelectItem value="follow">Seguir en Redes</SelectItem>
                      <SelectItem value="shortener">Pasar Acortador</SelectItem>
                      <SelectItem value="video">Ver Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Tarea</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/pagina-a-visitar" {...field} />
                  </FormControl>
                  <FormDescription>
                    El enlace que los usuarios deben visitar para completar la tarea.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(taskType === "visit" || taskType === "video") && (
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (en segundos)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormDescription>
                        Opcional. El tiempo que el usuario debe permanecer en la página.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntos Asignados</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeatable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Tarea Repetible</FormLabel>
                    <FormDescription>
                        Permite que los usuarios vuelvan a hacer esta tarea después de un tiempo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isRepeatable && (
                <FormField
                control={form.control}
                name="repeatIntervalHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo de Repetición (en horas)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 24" {...field} />
                    </FormControl>
                     <FormDescription>
                        El número de horas que el usuario debe esperar para repetir la tarea.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publicar Tarea
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
