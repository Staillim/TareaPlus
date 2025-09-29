"use client";

import { Button } from "@/components/ui/button";

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

export function GoogleButton() {
  const handleGoogleSignIn = () => {
    // This is where you would handle Google Sign-In logic
    console.log("Google Sign-In clicked");
    // Implement Google Sign-In API call here
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      Google
    </Button>
  );
}
