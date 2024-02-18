import { useState } from "react";
import { useError } from "@/hooks/error";
import { useSession } from "@/hooks/session";
import { useNavigate } from "react-router-dom";

import { loginWithEmail } from "@/lib/electronMainSdk";

import { LoginCard } from "@/components/loginCard";

/**
 * Component used to render the login page.
 */
export function LoginPage() {
  const { login } = useSession();
  const navigate = useNavigate();
  const { handleError } = useError();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLoginWithEmail = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      setIsSubmitting(true);
      const user = await loginWithEmail({ email, password });
      login(user);
      navigate("/");
    } catch (error) {
      handleError({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen">
      <LoginCard
        onLoginWithEmail={onLoginWithEmail}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
