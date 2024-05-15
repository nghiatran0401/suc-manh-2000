import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  notificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider, { axiosInstance } from "@refinedev/simple-rest";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { AppIcon } from "./components/app-icon";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { useAuthState } from "react-firebase-hooks/auth";
import { Login } from "./pages/login";
import {
  ConstructionResource,
  ContactResource,
  ProjectResource,
  ServiceResource,
} from "./resources";
import {
  ProjectCreate,
  ProjectEdit,
  ProjectShow,
  ProjectList,
} from "./pages/projects";
import { useEffect } from "react";
import { auth } from "./firebase/client";
import { User } from "firebase/auth";
function App() {
  const onUserChanged = async (user?: User | null) => {
    if (user) {
      const user_token = await user.getIdToken();
      axiosInstance.interceptors.request.use(async (config) => {
        config.headers!["Authorization"] = user_token;
        return config;
      });
    }
  };
  const { t, i18n } = useTranslation();
  const [user] = useAuthState(auth);

  useEffect(() => {
    onUserChanged(user);
  }, [user]);

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <Refine
            dataProvider={dataProvider(
              `${import.meta.env.VITE_BASE_URL}`,
              axiosInstance
            )}
            notificationProvider={notificationProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            routerProvider={routerBindings}
            resources={[ProjectResource, ServiceResource, ConstructionResource, ContactResource]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                      Title={({ collapsed }) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          text="Sucmanh2000"
                          icon={<AppIcon />}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={
                    <NavigateToResource resource={ProjectResource.name} />
                  }
                />
                <Route path={ProjectResource.name}>
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path="edit/:id" element={<ProjectEdit />} />
                  <Route path="show/:id" element={<ProjectShow />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
