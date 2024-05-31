import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./client";

export const AuthService = {
  // loginWithGoogle: async () => {
  //   const provider = new GoogleAuthProvider();
  //   const result = await signInWithPopup(auth, provider);
  //   return result.user;
  // },
  loginWithEmailAndPassword: async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },
  logout: async () => {
    await auth.signOut();
  },
};
