
'use server';

import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/lib/firebase/firebase";

const auth = getAuth(app);

export async function handleForgotPasswordAction(email: string): Promise<{ success: boolean; message: string; }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      message: 'Por favor, introduce una dirección de correo electrónico válida.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Si tu correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve.',
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    // Firebase returns a generic "auth/user-not-found" error if the email doesn't exist,
    // but we will return a generic success message to prevent user enumeration attacks.
    if (error.code === 'auth/user-not-found') {
        return {
            success: true,
            message: 'Si tu correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve.',
        };
    }
    return {
      success: false,
      message: 'Ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.',
    };
  }
}
