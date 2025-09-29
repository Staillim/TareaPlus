"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
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
  } from "@/components/ui/alert-dialog"

type GiftCard = {
    id: string;
    name: string;
    points: number;
    logoUrl: string;
    value?: string;
}

type RedeemSectionProps = {
    userPoints: number;
}

export function RedeemSection({ userPoints }: RedeemSectionProps) {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
        try {
            const rewardsCollection = collection(firestore, "rewards");
            const rewardsSnapshot = await getDocs(rewardsCollection);
            const rewardsList = rewardsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    points: data.points,
                    logoUrl: data.logoUrl,
                    value: data.value || ""
                } as GiftCard
            });
            setRewards(rewardsList);
        } catch (error) {
            console.error("Error fetching rewards:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las recompensas." });
        } finally {
            setLoading(false);
        }
    }
    fetchRewards();
  }, [toast]);


  const handleRedeem = (card: GiftCard) => {
      toast({
          title: "¡Canje Exitoso!",
          description: `Has canjeado una tarjeta de ${card.name} por ${card.points.toLocaleString()} puntos.`,
      })
  }

  if (loading) {
    return (
        <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
          <h2 className="text-xl font-bold font-headline">Canjear Recompensas</h2>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex flex-col">
                    <CardContent className="p-4 flex-grow flex flex-col items-center justify-center space-y-2">
                        <div className="h-16 w-16 bg-muted rounded-lg animate-pulse" />
                        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    </CardContent>
                    <CardFooter className="p-2 border-t">
                        <Button className="w-full" disabled>
                            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>
        </section>
      );
  }
  
  return (
    <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl font-bold font-headline">Canjear Recompensas</h2>
      <div className="grid grid-cols-2 gap-4">
        {rewards.map((card) => {
          const canAfford = userPoints >= card.points;
          return (
            <Card key={card.id} className="flex flex-col">
              <CardContent className="p-4 flex-grow flex flex-col items-center justify-center">
                <Image src={card.logoUrl} alt={`${card.name} logo`} width={64} height={64} className="h-16 w-16 object-contain mb-2" />
                <p className="font-bold text-lg">{card.name}</p>
                {card.value && <p className="text-sm text-muted-foreground">{card.value}</p>}
              </CardContent>
              <CardFooter className="p-2 border-t">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={!canAfford}>
                            {card.points.toLocaleString()} Puntos
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar canje?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto deducirá {card.points.toLocaleString()} puntos de tu saldo para obtener una tarjeta de regalo de {card.name}{card.value ? ` de ${card.value}` : ''}.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRedeem(card)}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
        )})}
      </div>
    </section>
  );
}