'use server';

/**
 * @fileOverview Password reset verification flow using LLM to validate email address.
 *
 * - passwordResetVerification - A function that handles the password reset verification process.
 * - PasswordResetVerificationInput - The input type for the passwordResetVerification function.
 * - PasswordResetVerificationOutput - The return type for the passwordResetVerification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PasswordResetVerificationInputSchema = z.object({
  email: z
    .string()
    .email()
    .describe('The email address to verify for password reset.'),
});
export type PasswordResetVerificationInput = z.infer<
  typeof PasswordResetVerificationInputSchema
>;

const PasswordResetVerificationOutputSchema = z.object({
  isValidEmail: z
    .boolean()
    .describe('Whether the email address is valid or not.'),
});
export type PasswordResetVerificationOutput = z.infer<
  typeof PasswordResetVerificationOutputSchema
>;

export async function passwordResetVerification(
  input: PasswordResetVerificationInput
): Promise<PasswordResetVerificationOutput> {
  return passwordResetVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'passwordResetVerificationPrompt',
  input: {schema: PasswordResetVerificationInputSchema},
  output: {schema: PasswordResetVerificationOutputSchema},
  prompt: `You are an email verification expert. Determine if the provided email address is valid or not.\n\nEmail: {{{email}}}\n\nRespond with JSON in the following format: { \"isValidEmail\": true/false }.
`,
});

const passwordResetVerificationFlow = ai.defineFlow(
  {
    name: 'passwordResetVerificationFlow',
    inputSchema: PasswordResetVerificationInputSchema,
    outputSchema: PasswordResetVerificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
