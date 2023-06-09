import React, { useContext, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

interface User {
  // Define your user properties here
}

interface AuthContextProps {
  signIn: () => void;
  signOut: () => void;
  user: User | null;
}

const AuthContext = React.createContext<AuthContextProps | null>(null);

// This hook can be used to access the user info.
export function useAuth(): AuthContextProps {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return authContext;
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null): void {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // If the user is not signed in and the initial segment is not anything in the auth group.
      router.replace("/login"); // Redirect to the login page.
    } else if (user && inAuthGroup) {
      // Redirect away from the login page.
      router.replace("/");
    }
  }, [user, segments, router]);
}

export function Provider(props: { children: React.ReactNode }): JSX.Element {
  const [user, setAuth] = React.useState<User | null>(null);

  useProtectedRoute(user);

  const authContextValue: AuthContextProps = {
    signIn: () => setAuth({}),
    signOut: () => setAuth(null),
    user,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
