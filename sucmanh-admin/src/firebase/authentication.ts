import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { auth, firestore } from "./client";

export enum LoginType {
  Google,
  EmailAndPassword,
}

interface UserInfo {
  uid: string;
  email: string;
  role?: string;
}

export const AuthService = {
  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },
  loginWithEmailAndPassword: async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },
  forgotPassword: async (email: string) => {
    try {
      const result = await sendPasswordResetEmail(auth, email);
      return `Sent email to ${email}`;
    } catch (e) {
      return "Errors occur, try again later!";
    }
  },

  logout: async () => {
    await auth.signOut();
  },

  getUserInfo: async (user: User) => {
    if (!user) return null;
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const initialData = {
        uid: user.uid,
        email: user.email,
        fivetranGroupdId: "",
      };
      await setDoc(userRef, initialData);
      return initialData as unknown as UserInfo;
    } else {
      const result = userDoc.data() as UserInfo;
      return result;
    }
  },
};

export const firebaseAuthErrorCodes: { [key: string]: string } = {
  "auth/app-deleted": "The Firebase app has been deleted.",
  "auth/app-not-authorized":
    "The Firebase app is not authorized to use Firebase Authentication.",
  "auth/argument-error":
    "An invalid argument was provided to a Firebase Authentication method.",
  "auth/invalid-api-key": "The provided API key is invalid.",
  "auth/invalid-user-token": "The user's token is invalid, expired or revoked.",
  "auth/network-request-failed":
    "A network error occurred while attempting to reach the Firebase Authentication servers.",
  "auth/operation-not-allowed":
    "The requested Firebase Authentication operation is not allowed.",
  "auth/requires-recent-login":
    "The user's last authentication was too long ago.",
  "auth/too-many-requests":
    "Firebase Authentication has blocked all requests from this device due to unusual activity.",
  "auth/unauthorized-domain":
    "The Firebase Authentication domain is not authorized for the project.",
  "auth/user-disabled":
    "The user's account has been disabled by an administrator.",
  "auth/user-not-found": "User does not exist.",
  "auth/wrong-password": "The password you entered is incorrect .",
  "auth/email-already-in-use":
    "Email already in use, please sign in or use a different email address",
};
