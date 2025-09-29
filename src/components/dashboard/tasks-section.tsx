
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, writeBatch, serverTimestamp, query, orderBy, limit, getDocs as getSubDocs, collection as subCollection } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Instagram, Link2, Youtube, Check, Loader2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInHours } from 'date-fns';

const iconMap: { [key: string]: React.ElementType } = {
  visit: Globe,
  follow: Instagram,
  shortener: Link2,
  video: Youtube,
  repeatable: History,
};

type Task = {
  id: string;
  title: string;
  type: string;
  url: string;
  points: number;
  duration?: number;
  repeatable?: boolean;
  repeatIntervalHours?: number;
};

type CompletedTaskHistory = {
  taskId: string;
  completedAt: {
    toDate: () => Date;
  };
}

type TasksSectionProps = {
  userId: string;
}

export function TasksSection({ userId }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Map<string, Date>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasksAndHistory = async () => {
      try {
        // Fetch available tasks
        const tasksCollection = collection(firestore, "tasks");
        const tasksSnapshot = await getDocs(tasksCollection);
        const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        // @ts-ignore
        setTasks(tasksList.filter(task => task.status === 'active'));

        // Fetch user's completion history
        const historyCollection = subCollection(firestore, 'users', userId, 'completedTasksHistory');
        const historyQuery = query(historyCollection, orderBy('completedAt', 'desc'));
        const historySnapshot = await getSubDocs(historyQuery);
        
        const historyMap = new Map<string, Date>();
        historySnapshot.docs.forEach(doc => {
            const data = doc.data() as CompletedTaskHistory;
            // Store only the most recent completion for each task ID
            if (!historyMap.has(data.taskId)) {
                historyMap.set(data.taskId, data.completedAt.toDate());
            }
        });
        setCompletedTasks(historyMap);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las tareas o el historial." });
      } finally {
        setLoading(false);
      }
    };
    if(userId) {
        fetchTasksAndHistory();
    }
  }, [userId, toast]);

  const handleCompleteTask = async (task: Task) => {
    setCompleting(task.id);
    try {
      openTaskUrl(task.url);

      await new Promise(resolve => setTimeout(resolve, task.duration ? task.duration * 1000 : 2000));

      const now = new Date();
      const completionTimestamp = serverTimestamp();

      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', userId);
      
      // We only increment points. We don't touch a "completedTasks" array anymore.
      batch.update(userRef, {
        points: increment(task.points)
      });

      const taskRef = doc(firestore, 'tasks', task.id);
      batch.update(taskRef, {
        completions: increment(1)
      });
      
      const historyRef = doc(subCollection(userRef, 'completedTasksHistory'));
      batch.set(historyRef, {
          taskId: task.id,
          points: task.points,
          completedAt: completionTimestamp
      });

      await batch.commit();
      
      // Optimistically update local state
      setCompletedTasks(prev => new Map(prev).set(task.id, now));

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
          <Card key={i} className="p-4 bg-card/80 backdrop-blur-sm">
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

  const isTaskAvailable = (task: Task) => {
    if (!completedTasks.has(task.id)) {
        return true; // Not completed yet
    }
    if (!task.repeatable || !task.repeatIntervalHours) {
        return false; // Completed and not repeatable
    }
    const lastCompletion = completedTasks.get(task.id);
    if (!lastCompletion) return true;

    const hoursSinceCompletion = differenceInHours(new Date(), lastCompletion);
    return hoursSinceCompletion >= task.repeatIntervalHours;
  }

  const availableTasks = tasks.filter(isTaskAvailable);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Tareas Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableTasks.length > 0 ? availableTasks.map((task) => {
          const Icon = task.repeatable ? History : iconMap[task.type] || Globe;
          const isCompleting = completing === task.id;

          return (
            <Card key={task.id} className="animated-card from-gradient-1-start to-gradient-1-end">
              <div className="particles-container">
                {[...Array(15)].map((_, i) => <div key={i} className="particle"></div>)}
              </div>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold truncate text-white">{task.title}</p>
                    <p className="text-sm text-primary-foreground/80">{task.points} Puntos</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCompleteTask(task)}
                  disabled={isCompleting}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCompleting ? 'Verificando...' : 'Hacer'}
                </Button>
              </CardContent>
            </Card>
          );
        }) : (
            <div className="md:col-span-2 text-center py-10">
                <p className="text-muted-foreground">No hay nuevas tareas disponibles por el momento.</p>
            </div>
        )}
      </div>
    </section>
  );
}
