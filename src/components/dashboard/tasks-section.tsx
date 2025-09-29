"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Instagram, Link2, Youtube, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: React.ElementType } = {
  visit: Globe,
  follow: Instagram,
  shortener: Link2,
  video: Youtube,
};

type Task = {
  id: string;
  title: string;
  type: string;
  url: string;
  points: number;
  duration?: number;
};

type TasksSectionProps = {
  userId: string;
  completedTasks: string[];
}

export function TasksSection({ userId, completedTasks }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksCollection = collection(firestore, "tasks");
        const tasksSnapshot = await getDocs(tasksCollection);
        const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las tareas." });
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [toast]);

  const handleCompleteTask = async (task: Task) => {
    setCompleting(task.id);
    try {
        // Simulate task completion
        await new Promise(resolve => setTimeout(resolve, 1500));

        const userRef = doc(firestore, 'users', userId);
        
        await updateDoc(userRef, {
            completedTasks: arrayUnion(task.id),
            points: increment(task.points)
        });

        toast({
            title: "¡Tarea Completada!",
            description: `Has ganado ${task.points} puntos.`,
        });

    } catch (error) {
        console.error("Error completing task: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo completar la tarea. Inténtalo de nuevo.",
        });
    } finally {
        setCompleting(null);
    }
  }

  const openTaskUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted p-3 rounded-lg animate-pulse h-12 w-12" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl font-bold font-headline">Tareas Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const Icon = iconMap[task.type] || Globe;
          const isCompleted = completedTasks.includes(task.id);
          const isCompleting = completing === task.id;

          return (
            <Card key={task.id} className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="bg-secondary p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold truncate">{task.title}</p>
                    <p className="text-sm text-primary">{task.points} Puntos</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                      if(task.type === 'visit' || task.type === 'video' || task.type === 'shortener' || task.type === 'follow') {
                          openTaskUrl(task.url);
                      }
                      handleCompleteTask(task);
                  }}
                  disabled={isCompleted || isCompleting}
                >
                  {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCompleted && <Check className="mr-2 h-4 w-4" />}
                  {isCompleting ? 'Completando...' : isCompleted ? 'Completada' : 'Completar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
