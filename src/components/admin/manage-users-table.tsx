
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
import { Loader2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type User = {
    id: string;
    username: string;
    email: string;
    points: number;
}

export function ManageUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'user'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching users: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Usuarios</CardTitle>
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
        <CardTitle>Gestionar Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                    </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Award className="h-4 w-4 text-primary" />
                       <span>{user.points.toLocaleString()}</span>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

