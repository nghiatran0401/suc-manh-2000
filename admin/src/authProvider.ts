import { AuthBindings } from "@refinedev/core";
import { auth } from "./firebase/client";
import { User } from "firebase/auth";
import { AuthService } from "./firebase/authentication";
import { ProjectResource } from "./resources";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthBindings = {
  login: async (props) => {
    const { email, password } = props;
    console.log(props)
    try {
      let user: User | null = null;

      user = await AuthService.loginWithEmailAndPassword(email, password);
      console.log(user)
      if (user) {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(user));
        return {
          success: true,
          redirectTo: ProjectResource.list,
        };
      } else {
        return {
          success: false,
          error: {
            name: "Please use admin account",
            message: "Invalid username or password",
          },
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: {
          name: e.message,
          message: "Invalid username or password",
        },
      };
    }
  },
  logout: async () => {
    AuthService.logout();
    localStorage.clear();
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const js = localStorage.getItem(TOKEN_KEY) ?? "null";
    const user = JSON.parse(js);
    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const js = localStorage.getItem(TOKEN_KEY);
    const user = js ? JSON.parse(js) : auth.currentUser;
    if (user) {
      return {
        id: user.uid,
        name: user.displayName ?? user.email,
        avatar: user.photoURL,
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
