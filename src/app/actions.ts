
'use server';

import { passwordResetVerification } from '@/ai/flows/password-reset-verification';

export async function handleForgotPasswordAction(email: string): Promise<{ success: boolean; message: string; }> {
  // Basic email format validation before calling the AI flow
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      message: 'Por favor, introduce una dirección de correo electrónico válida.',
    };
  }

  try {
    const result = await passwordResetVerification({ email });

    // For security reasons (to prevent user enumeration attacks), we return a generic success message
    // regardless of whether the email was found to be "valid" or not by the AI.
    // In a real application, the email sending service would handle the delivery.
    if (result.isValidEmail) {
      console.log(`Password reset initiated for potentially valid email: ${email}`);
    } else {
      console.log(`Password reset initiated for potentially invalid email (per AI check): ${email}`);
    }

    return {
      success: true,
      message: 'Si tu correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve.',
    };

  } catch (error) {
    console.error('Error in password reset flow:', error);
    // In case of a system error, inform the user something went wrong.
    return {
      success: false,
      message: 'Ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.',
    };
  }
}
