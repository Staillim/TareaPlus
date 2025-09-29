"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type Reward = {
    id: string;
    name: string;
    points: number;
    logoUrl: string;
}

export function ManageRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState("");
  const [newRewardLogoUrl, setNewRewardLogoUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "rewards"), (snapshot) => {
        const rewardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
        setRewards(rewardsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching rewards: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las recompensas.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddReward = async () => {
    if (!newRewardName || !newRewardPoints || !newRewardLogoUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }
    setIsAdding(true);
    try {
        await addDoc(collection(firestore, "rewards"), {
            name: newRewardName,
            points: parseInt(newRewardPoints, 10),
            logoUrl: newRewardLogoUrl,
        });
        setNewRewardName("");
        setNewRewardPoints("");
        setNewRewardLogoUrl("");
        toast({
          title: "Recompensa Añadida",
          description: `Se ha añadido la recompensa "${newRewardName}".`
        });
    } catch (error) {
        console.error("Error adding reward: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo añadir la recompensa.' });
    } finally {
        setIsAdding(false);
    }
  };

  const handleRemoveReward = async (id: string) => {
    try {
        await deleteDoc(doc(firestore, "rewards", id));
        toast({
            title: "Recompensa Eliminada"
        });
    } catch (error) {
        console.error("Error removing reward: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la recompensa.' });
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Añadir Nueva Recompensa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-name">Nombre de la Recompensa</Label>
            <Input 
              id="reward-name" 
              placeholder="e.g., Spotify 1 Mes"
              value={newRewardName}
              onChange={(e) => setNewRewardName(e.target.value)}
              disabled={isAdding}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-points">Puntos Requeridos</Label>
            <Input 
              id="reward-points" 
              type="number" 
              placeholder="e.g., 10000" 
              value={newRewardPoints}
              onChange={(e) => setNewRewardPoints(e.target.value)}
              disabled={isAdding}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-logo">URL del Logo</Label>
            <Input 
              id="reward-logo" 
              placeholder="https://ejemplo.com/logo.png"
              value={newRewardLogoUrl}
              onChange={(e) => setNewRewardLogoUrl(e.target.value)}
              disabled={isAdding}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddReward} disabled={isAdding}>
            {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isAdding ? 'Añadiendo...' : 'Añadir Recompensa'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recompensas Actuales</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {rewards.map((reward) => (
                        <TableRow key={reward.id}>
                        <TableCell>
                           <Image src={reward.logoUrl} alt={reward.name} width={40} height={40} className="rounded-md object-contain" />
                        </TableCell>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>{reward.points.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveReward(reward.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}