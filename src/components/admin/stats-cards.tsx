
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, getDocs, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, ListChecks, CheckCircle, Loader2 } from "lucide-react";

export function StatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pointsDistributed: 0,
    activeTasks: 0,
    tasksCompletedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersUnsubscribe = onSnapshot(collection(firestore, 'users'), (snapshot) => {
        setStats(prevStats => ({ ...prevStats, totalUsers: snapshot.size }));
        if (loading) setLoading(false);
    });

    const tasksUnsubscribe = onSnapshot(collection(firestore, 'tasks'), (snapshot) => {
        const activeTasks = snapshot.docs.filter(doc => doc.data().status === 'active').length;
        setStats(prevStats => ({ ...prevStats, activeTasks: activeTasks }));
        if (loading) setLoading(false);
    });

    const fetchCompletedToday = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTimestamp = Timestamp.fromDate(today);
        const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        let totalCompletions = 0;

        for (const userDoc of usersSnapshot.docs) {
            const historyCollection = collection(firestore, `users/${userDoc.id}/completedTasksHistory`);
            const q = query(historyCollection, 
                where('completedAt', '>=', todayTimestamp),
                where('completedAt', '<', tomorrowTimestamp)
            );
            const historySnapshot = await getDocs(q);
            totalCompletions += historySnapshot.size;
        }

        setStats(prevStats => ({...prevStats, tasksCompletedToday: totalCompletions}));
    }

    fetchCompletedToday();
    // Re-fetch every minute
    const interval = setInterval(fetchCompletedToday, 60000);

    return () => {
        usersUnsubscribe();
        tasksUnsubscribe();
        clearInterval(interval);
    }
  }, [loading])


  if (loading) {
      return (
        <div className="flex min-h-[150px] w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
  }


  return (
    <section className="space-y-6">
       <h1 className="text-3xl font-bold">Dashboard de Administrador</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompletedToday.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Distribuidos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Próximamente</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

