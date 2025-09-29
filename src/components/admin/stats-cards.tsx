
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, ListChecks, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dailyActivityData = [
  { name: 'Lun', users: 30, tasks: 50 },
  { name: 'Mar', users: 45, tasks: 60 },
  { name: 'Mié', users: 60, tasks: 90 },
  { name: 'Jue', users: 50, tasks: 75 },
  { name: 'Vie', users: 70, tasks: 110 },
  { name: 'Sáb', users: 90, tasks: 130 },
  { name: 'Dom', users: 85, tasks: 120 },
];

export function StatsCards() {
  // Mock data
  const stats = {
    totalUsers: 1253,
    pointsDistributed: 578200,
    activeTasks: 24,
    totalRedeemed: 4500
  };

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
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Distribuidos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">+5 desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Canjeado (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+19% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Actividad de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="hsl(var(--primary))" name="Nuevos Usuarios" />
                <Bar dataKey="tasks" fill="hsl(var(--secondary))" name="Tareas Completadas" />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
