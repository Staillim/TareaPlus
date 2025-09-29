
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, doc, writeBatch, serverTimestamp, query, getDocs as getSubDocs, collection as subCollection, increment } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Instagram, Link2, Youtube, History, Loader2, PartyPopper, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInHours, addHours, differenceInSeconds } from 'date-fns';
import { Separator } from "../ui/separator";

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
  status?: 'active' | 'paused';
};

type CompletedTaskHistory = {
  taskId: string;
  completedAt: {
    toDate: () => Date;
  };
}

type TaskState = 'idle' | 'timing' | 'ready_to_claim' | 'claiming';
type TaskStatus = {
    [taskId: string]: TaskState;
};

type TaskTimer = {
    startTime: number;
    task: Task;
};

type TasksSectionProps = {
  userId: string;
}

const CountdownTimer = ({ nextAvailableDate }: { nextAvailableDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState(differenceInSeconds(nextAvailableDate, new Date()));

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex items-center gap-2">
            <Clock className="mr-2 h-4 w-4" />
            <span>{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>
        </div>
    );
};


export function TasksSection({ userId }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus>({});
  const [completedTasks, setCompletedTasks] = useState<Map<string, Date>>(new Map());
  const { toast } = useToast();
  
  const [activeTimer, setActiveTimer] = useState<TaskTimer | null>(null);

  const fetchTasksAndHistory = useCallback(async () => {
    try {
      const tasksCollection = query(collection(firestore, "tasks"), );
      const tasksSnapshot = await getSubDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksList.filter(task => task.status === 'active'));

      const historyCollection = subCollection(firestore, 'users', userId, 'completedTasksHistory');
      const historyQuery = query(historyCollection);
      const historySnapshot = await getSubDocs(historyQuery);
      
      const historyMap = new Map<string, Date>();
      historySnapshot.docs.forEach(doc => {
          const data = doc.data() as CompletedTaskHistory;
          // Store only the most recent completion for each task
          if (!historyMap.has(data.taskId) || historyMap.get(data.taskId)! < data.completedAt.toDate()) {
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
  }, [userId, toast]);

  useEffect(() => {
    if(userId) {
        fetchTasksAndHistory();
    }
  }, [userId, fetchTasksAndHistory]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && activeTimer) {
        const { startTime, task } = activeTimer;
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        setActiveTimer(null); // Clear the timer

        if (elapsedTime >= (task.duration || 0)) {
            // Time requirement met
            setTaskStatuses(prev => ({ ...prev, [task.id]: 'ready_to_claim' }));
        } else {
            // Time requirement not met
            const timeLeft = Math.ceil((task.duration || 0) - elapsedTime);
            toast({
                variant: "destructive",
                title: "Tiempo insuficiente",
                description: `Regresaste muy pronto. Te faltaron ~${timeLeft} segundos. La tarea se ha reiniciado.`,
            });
            setTaskStatuses(prev => ({ ...prev, [task.id]: 'idle' }));
        }
    }
  }, [activeTimer, toast]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const startTask = (task: Task) => {
    window.open(task.url, '_blank', 'noopener,noreferrer');

    if (task.duration && task.duration > 0) {
        // Task with timer
        setTaskStatuses(prev => ({ ...prev, [task.id]: 'timing' }));
        setActiveTimer({ startTime: Date.now(), task });
    } else {
        // Instant task (no duration) -> go straight to claiming
        setTaskStatuses(prev => ({ ...prev, [task.id]: 'ready_to_claim' }));
        claimReward(task);
    }
  }

  const claimReward = async (task: Task) => {
    setTaskStatuses(prev => ({ ...prev, [task.id]: 'claiming' }));
    try {
      const now = new Date();
      const completionTimestamp = serverTimestamp();

      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', userId);
      
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
      
      setCompletedTasks(prev => new Map(prev).set(task.id, now));

      toast({
        title: "¡Recompensa Reclamada!",
        description: `Has ganado ${task.points} puntos.`,
      });

    } catch (error) {
      console.error("Error completing task: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reclamar la recompensa. Inténtalo de nuevo.",
      });
    } finally {
      setTaskStatuses(prev => ({ ...prev, [task.id]: 'idle' }));
    }
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

  const getTaskAvailability = (task: Task) => {
    const lastCompletion = completedTasks.get(task.id);
    if (!lastCompletion) {
        return { available: true, nextAvailableDate: null };
    }
    if (!task.repeatable || !task.repeatIntervalHours) {
        return { available: false, nextAvailableDate: null };
    }
    
    const nextAvailableDate = addHours(lastCompletion, task.repeatIntervalHours);
    const isAvailable = new Date() >= nextAvailableDate;
    
    return { available: isAvailable, nextAvailableDate: isAvailable ? null : nextAvailableDate };
  };

  const getButtonContent = (task: Task, isAvailable: boolean) => {
    const status = taskStatuses[task.id] || 'idle';
    if (!isAvailable) return null; // Let the countdown timer handle the content

    switch (status) {
        case 'timing':
            return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Esperando...</>;
        case 'ready_to_claim':
            return <><PartyPopper className="mr-2 h-4 w-4" /> Reclamar</>;
        case 'claiming':
            return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reclamando...</>;
        case 'idle':
        default:
            return 'Hacer';
    }
  };

  const allActiveTasks = tasks;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Tareas Disponibles</h2>
      <div className="grid grid-cols-1 gap-4">
        {allActiveTasks.length > 0 ? allActiveTasks.map((task) => {
          const Icon = task.repeatable ? History : iconMap[task.type] || Globe;
          const status = taskStatuses[task.id] || 'idle';
          const isProcessing = status === 'timing' || status === 'claiming';
          
          const { available, nextAvailableDate } = getTaskAvailability(task);
          const buttonContent = getButtonContent(task, available);

          return (
            <Card key={task.id} className="bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-primary">{task.points} Puntos</span>
                        {task.duration && ` | ${task.duration} seg`}
                    </p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block"/>
                <Separator className="sm:hidden"/>
                <Button
                  onClick={() => available && (status === 'ready_to_claim' ? claimReward(task) : startTask(task))}
                  disabled={!available || isProcessing}
                  variant={status === 'ready_to_claim' ? 'default' : 'secondary'}
                  className="w-full sm:w-auto"
                >
                  {available ? buttonContent : <CountdownTimer nextAvailableDate={nextAvailableDate!} />}
                </Button>
              </CardContent>
            </Card>
          );
        }) : (
            <div className="text-center py-10 bg-card/50 rounded-lg">
                <p className="text-muted-foreground">No hay nuevas tareas disponibles por el momento.</p>
            </div>
        )}
      </div>
    </section>
  );
}

    