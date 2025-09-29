"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Instagram, Link2, Youtube } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const tasks = [
  {
    id: 1,
    title: "Visita esta página web por 2 minutos",
    icon: Globe,
    action: "Ver Detalles",
    progress: 45
  },
  {
    id: 2,
    title: "Sigue a esta persona en Instagram",
    icon: Instagram,
    action: "Completar",
  },
  {
    id: 3,
    title: "Pasa por este acortador de enlaces",
    icon: Link2,
    action: "Completar",
  },
  {
    id: 4,
    title: "Mira un video promocional de 30 segundos",
    icon: Youtube,
    action: "Ver Detalles",
    progress: 80
  },
];

export function TasksSection() {
  return (
    <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl font-bold font-headline">Tareas Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-lg">
                  <task.icon className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{task.title}</p>
                  {task.progress !== undefined && (
                     <div className="mt-2">
                        <Progress value={task.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{task.progress}% completado</p>
                    </div>
                  )}
                </div>
              </div>
              <Button size="sm">{task.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
