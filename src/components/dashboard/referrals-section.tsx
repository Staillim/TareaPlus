"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Clipboard, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReferralsSectionProps = {
  referrals: number;
  referralCode: string;
};

export function ReferralsSection({ referrals, referralCode }: ReferralsSectionProps) {
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        toast({
            title: "Copiado",
            description: "Tu código de referido ha sido copiado al portapapeles.",
        });
    }

    const handleShare = () => {
        if(navigator.share) {
            navigator.share({
                title: '¡Únete y gana recompensas!',
                text: `Usa mi código de referido para empezar: ${referralCode}`,
                url: window.location.href,
            })
        } else {
            handleCopy();
            toast({
                title: "Compartir no disponible",
                description: "Tu navegador no soporta la función de compartir. El código ha sido copiado.",
            });
        }
    }

  return (
    <section className="space-y-4 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl font-bold font-headline">Programa de Referidos</h2>
      <Card>
        <CardContent className="p-6 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-primary" />
            <p className="text-4xl font-bold mt-2">{referrals}</p>
            <p className="text-muted-foreground">Amigos Referidos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Tu Código de Invitación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-3 border-2 border-dashed border-primary rounded-lg bg-primary/10">
            <span className="text-2xl font-mono font-bold text-primary tracking-widest">{referralCode}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleCopy}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copiar
            </Button>
            <Button variant="secondary" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
