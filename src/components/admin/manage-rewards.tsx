
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

const initialRewards = [
  { id: 1, name: "Amazon $10", points: 10000 },
  { id: 2, name: "Google Play $15", points: 15000 },
  { id: 3, name: "Netflix 1 Mes", points: 12000 },
];

export function ManageRewards() {
  const [rewards, setRewards] = useState(initialRewards);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState("");
  const { toast } = useToast();

  const handleAddReward = () => {
    if (!newRewardName || !newRewardPoints) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa ambos campos.",
      });
      return;
    }
    const newReward = {
      id: rewards.length + 1,
      name: newRewardName,
      points: parseInt(newRewardPoints, 10),
    };
    setRewards([...rewards, newReward]);
    setNewRewardName("");
    setNewRewardPoints("");
    toast({
      title: "Recompensa Añadida",
      description: `Se ha añadido la recompensa "${newRewardName}".`
    })
  };

  const handleRemoveReward = (id: number) => {
    setRewards(rewards.filter(reward => reward.id !== id));
    toast({
        title: "Recompensa Eliminada"
    })
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
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddReward}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Recompensa
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recompensas Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
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
        </CardContent>
      </Card>
    </div>
  );
}
