
"use client";

import { signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth, googleProvider, firestore } from "@/lib/firebase/firebase";
import { doc, setDoc, getDocs, collection, query, where, writeBatch, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.12 1.9-4.4 0-7.9-3.6-7.9-8s3.5-8 7.9-8c2.3 0 3.8.9 4.7 1.8l2.8-2.8C19.3 1.1 16.3 0 12.48 0 5.88 0 .04 5.8 .04 12.9s5.84 12.9 12.44 12.9c3.34 0 6.03-1.1 8.04-3.1 2.1-2.1 2.8-5.2 2.8-7.7v-1.1H12.48z" />
    </svg>
  );

// Function to generate a random referral code
const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

async function isReferralCodeValid(code: string): Promise<{valid: boolean, referrerId: string | null}> {
  if (!code) return {valid: false, referrerId: null};
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("referralCode", "==", code));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
      return {valid: false, referrerId: null};
  }
  const referrerDoc = querySnapshot.docs[0];
  return {valid: true, referrerId: referrerDoc.id};
}

export function GoogleButton() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      
      const batch = writeBatch(firestore);

      if (additionalInfo?.isNewUser) {
        const refCode = searchParams.get('ref');
        let usedReferralCode: string | undefined = undefined;
        let referrerId: string | null = null;
        
        if (refCode) {
            const referralCheck = await isReferralCodeValid(refCode);
            if (referralCheck.valid && referralCheck.referrerId) {
                referrerId = referralCheck.referrerId;
                usedReferralCode = refCode;
            } else {
                 toast({
                    variant: "destructive",
                    title: "Código Inválido",
                    description: "El código de referido del enlace no es válido.",
                });
            }
        }

        const newUserRef = doc(firestore, "users", user.uid);
        batch.set(newUserRef, {
            uid: user.uid,
            email: user.email,
            username: user.displayName || user.email?.split('@')[0],
            createdAt: serverTimestamp(),
            role: 'user',
            points: 0,
            referrals: 0,
            referralCode: generateReferralCode(),
            referredByCode: usedReferralCode
        });

        if (referrerId) {
            const referralRef = doc(collection(firestore, "referrals"));
            batch.set(referralRef, {
                referrerId: referrerId,
                referredId: user.uid,
                createdAt: serverTimestamp()
            });
        }
        
        await batch.commit();
        toast({
          title: "¡Cuenta creada con Google!",
          description: "Hemos creado tu cuenta exitosamente.",
        });
      } else {
         toast({
            title: "Éxito",
            description: "Has iniciado sesión con Google.",
          });
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error.message,
      });
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      Google
    </Button>
  );
}
