
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, ListChecks, DollarSign, Loader2 } from "lucide-react";

export function StatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pointsDistributed: 0,
    activeTasks: 0,
    totalRedeemed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersUnsubscribe = onSnapshot(collection(firestore, 'users'), (snapshot) => {
        setStats(prevStats => ({ ...prevStats, totalUsers: snapshot.size }));
        setLoading(false);
    });

    const tasksUnsubscribe = onSnapshot(collection(firestore, 'tasks'), (snapshot) => {
        const activeTasks = snapshot.docs.filter(doc => doc.data().status === 'active').length;
        setStats(prevStats => ({ ...prevStats, activeTasks: activeTasks }));
        setLoading(false);
    });
    
    // TODO: Implement logic for pointsDistributed and totalRedeemed

    return () => {
        usersUnsubscribe();
        tasksUnsubscribe();
    }
  }, [])


  if (loading) {
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center">
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
            <CardTitle className="text-sm font-medium">Puntos Distribuidos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsDistributed.toLocaleString()}</div>
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
            <CardTitle className="text-sm font-medium">Total Canjeado (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRedeemed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
