import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { ErrorComponent, notificationProvider, ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import dataProvider, { axiosInstance } from "@refinedev/simple-rest";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { authProvider } from "./authProvider";
import Header from "./components/Header";
import { Login } from "./pages/auth";
import { ProjectCreate, ProjectEdit, ProjectShow, ProjectList } from "./pages/projects";
import { useEffect } from "react";
import { auth } from "./firebase/client";
import { User } from "firebase/auth";
import { categoryMapping, icons } from "./constants";

const resources = Object.keys(categoryMapping).map((key, idx) => {
  const Icon = icons[idx];

  return {
    name: key,
    list: `/${key}`,
    create: `/${key}/create`,
    edit: `/${key}/edit/:id`,
    meta: {
      icon: <Icon />,
      label: categoryMapping[key as keyof typeof categoryMapping],
    },
  };
});

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
        <Refine
          dataProvider={dataProvider(`${import.meta.env.VITE_BASE_URL}`, axiosInstance)}
          notificationProvider={notificationProvider}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          routerProvider={routerBindings}
          resources={resources}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
            <Route
              element={
                <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                  <ThemedLayoutV2 Header={() => <Header sticky />} Sider={(props) => <ThemedSiderV2 {...props} fixed />} Title={({ collapsed }) => <ThemedTitleV2 collapsed={collapsed} text="Sức Mạnh 2000" />}>
                    <Outlet />
                  </ThemedLayoutV2>
                </Authenticated>
              }
            >
              <Route index element={<NavigateToResource resource={"du-an-2024"} />} />
              {resources.map((resource) => (
                <Route key={resource.name} path={resource.name}>
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path="edit/:id" element={<ProjectEdit />} />
                  {/* <Route path="show/:id" element={<ProjectShow />} /> */}
                </Route>
              ))}
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
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
