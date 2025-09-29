
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
    const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'user'));
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
        setStats(prevStats => ({ ...prevStats, totalUsers: snapshot.size }));
        if (loading) setLoading(false);
    });

    const tasksQuery = query(collection(firestore, 'tasks'), where('status', '==', 'active'));
    const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        setStats(prevStats => ({ ...prevStats, activeTasks: snapshot.docs.length }));
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
    const interval = setInterval(fetchCompletedToday, 60000);

    return () => {
        usersUnsubscribe();
        tasksUnsubscribe();
        clearInterval(interval);
    }
  }, [loading])


  if (loading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="animated-card from-gray-700 to-gray-800">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-2/3 bg-muted/50 animate-pulse rounded"></div>
                        <div className="h-4 w-4 bg-muted/50 animate-pulse rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-1/2 bg-muted/50 animate-pulse rounded mt-2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )
  }

  const statItems = [
      { title: "Total de Usuarios", value: stats.totalUsers, icon: Users, gradient: "from-gradient-1-start to-gradient-1-end" },
      { title: "Tareas Activas", value: stats.activeTasks, icon: ListChecks, gradient: "from-gradient-2-start to-gradient-2-end" },
      { title: "Tareas Completadas Hoy", value: stats.tasksCompletedToday, icon: CheckCircle, gradient: "from-gradient-3-start to-gradient-3-end" },
      { title: "Puntos Distribuidos", value: stats.pointsDistributed, icon: Award, gradient: "from-gray-700 to-gray-800", note: "Próximamente" },
  ]

  return (
    <section className="space-y-6">
       <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Dashboard de Administrador</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, index) => (
            <Card key={index} className={`animated-card ${item.gradient}`}>
                 <div className="particles-container">
                    {[...Array(15)].map((_, i) => <div key={i} className="particle"></div>)}
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">{item.title}</CardTitle>
                    <item.icon className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{item.value.toLocaleString()}</div>
                    {item.note && <p className="text-xs text-white/60">{item.note}</p>}
                </CardContent>
            </Card>
        ))}
      </div>
    </section>
  );
}
