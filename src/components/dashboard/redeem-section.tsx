"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const giftCards = [
  {
    id: 1,
    name: "Amazon",
    value: "$10",
    points: 10000,
    logo: "/gift-cards/amazon.svg",
  },
  {
    id: 2,
    name: "Google Play",
    value: "$15",
    points: 15000,
    logo: "/gift-cards/google-play.svg",
  },
  {
    id: 3,
    name: "Netflix",
    value: "1 Mes",
    points: 12000,
    logo: "/gift-cards/netflix.svg",
  },
  {
    id: 4,
    name: "Spotify",
    value: "1 Mes Premium",
    points: 10000,
    logo: "/gift-cards/spotify.svg",
  },
];

type RedeemSectionProps = {
    userPoints: number;
}

export function RedeemSection({ userPoints }: RedeemSectionProps) {
  const { toast } = useToast();

  const handleRedeem = (card: typeof giftCards[0]) => {
      toast({
          title: "¡Canje Exitoso!",
          description: `Has canjeado una tarjeta de ${card.name} por ${card.points.toLocaleString()} puntos.`,
      })
  }
  
  return (
    <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl font-bold font-headline">Canjear Recompensas</h2>
      <div className="grid grid-cols-2 gap-4">
        {giftCards.map((card) => {
          const canAfford = userPoints >= card.points;
          return (
            <Card key={card.id} className="flex flex-col">
              <CardContent className="p-4 flex-grow flex flex-col items-center justify-center">
                <Image src={card.logo} alt={`${card.name} logo`} width={64} height={64} className="h-16 w-16 object-contain mb-2" />
                <p className="font-bold text-lg">{card.name}</p>
                <p className="text-sm text-muted-foreground">{card.value}</p>
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
                            Esto deducirá {card.points.toLocaleString()} puntos de tu saldo para obtener una tarjeta de regalo de {card.name} de {card.value}.
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
