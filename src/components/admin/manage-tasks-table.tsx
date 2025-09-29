"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type Task = {
    id: string;
    title: string;
    type: string;
    points: number;
    status: 'active' | 'paused';
    completions: number;
}

const typeMap: {[key: string]: string} = {
    visit: 'Visitar Página',
    follow: 'Seguir en Redes',
    shortener: 'Pasar Acortador',
    video: 'Ver Video'
}

export function ManageTasksTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "tasks"), (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las tareas.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleDeleteTask = async (taskId: string) => {
    try {
        await deleteDoc(doc(firestore, "tasks", taskId));
        toast({ title: 'Tarea Eliminada', description: 'La tarea ha sido eliminada exitosamente.' });
    } catch (error) {
        console.error("Error deleting task: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la tarea.' });
    }
  }

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Tareas Existentes</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Tareas Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Completadas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{typeMap[task.type] || task.type}</TableCell>
                <TableCell>{task.points}</TableCell>
                <TableCell>{task.completions.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                    {task.status === 'active' ? 'Activa' : 'Pausada'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea
                          y sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
