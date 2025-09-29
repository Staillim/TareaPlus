
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

const taskSchema = z.object({
  type: z.enum(["visit", "follow", "shortener", "video"]),
  url: z.string().url({ message: "Por favor, introduce una URL válida." }),
  duration: z.coerce.number().optional(),
  points: z.coerce.number().min(1, { message: "Los puntos deben ser al menos 1." }),
});

export function CreateTaskForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      url: "",
      points: 100,
    },
  });

  const taskType = form.watch("type");

  function onSubmit(values: z.infer<typeof taskSchema>) {
    startTransition(() => {
      console.log(values);
      toast({
        title: "Tarea Publicada",
        description: "La nueva tarea está ahora disponible para los usuarios.",
      });
      form.reset();
      form.setValue('points', 100);
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
                  <FormLabel>URL o Contenido</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com" {...field} />
                  </FormControl>
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
