"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Gift, Handshake } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-purple-600 opacity-90"></div>
         <div className="orb-container">
            <div className="orb" style={{'--orb-color': 'hsl(var(--orb-1))', '--orb-blur': '100px', '--orb-size': '200px', top: '10%', left: '20%'}}></div>
            <div className="orb" style={{'--orb-color': 'hsl(var(--orb-2))', '--orb-blur': '120px', '--orb-size': '250px', top: '30%', left: '70%'}}></div>
            <div className="orb" style={{'--orb-color': 'hsl(var(--orb-3))', '--orb-blur': '80px', '--orb-size': '150px', top: '80%', left: '10%'}}></div>
            <div className="orb" style={{'--orb-color': 'hsl(var(--orb-4))', '--orb-blur': '150px', '--orb-size': '300px', top: '60%', left: '90%'}}></div>
        </div>

        <div className="relative z-10 container px-4 md:px-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Completa Tareas, Gana Puntos, Canjea Recompensas
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              Únete a nuestra comunidad y transforma tu tiempo libre en increíbles premios. ¡Es fácil, divertido y gratificante!
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/auth">
                Empezar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="#features">
                Saber Más
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-lg transition-transform hover:scale-105">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold">Gana Puntos</h3>
              <p className="mt-2 text-muted-foreground">
                Realiza tareas sencillas como ver videos, seguir en redes sociales o visitar sitios web para acumular puntos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-lg transition-transform hover:scale-105">
              <Gift className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold">Canjea Recompensas</h3>
              <p className="mt-2 text-muted-foreground">
                Usa tus puntos para canjear tarjetas de regalo de tus marcas favoritas como Amazon, Google Play, Spotify y más.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-lg transition-transform hover:scale-105">
              <Handshake className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold">Programa de Referidos</h3>
              <p className="mt-2 text-muted-foreground">
                Invita a tus amigos a unirse y gana aún más recompensas. ¡Crece con nosotros y maximiza tus ganancias!
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 bg-card text-card-foreground">
        <div className="container px-4 md:px-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">&copy; 2024 Acceso Seguro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
