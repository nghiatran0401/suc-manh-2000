import React, { useState, useEffect } from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { ErrorComponent, notificationProvider, ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { axiosInstance } from "@refinedev/simple-rest";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { authProvider } from "./utils/authProvider";
import Header from "./components/Header";
import { Login } from "./pages/auth";
import { ProjectCreate, ProjectEdit, ProjectList } from "./pages/projects";
import { auth } from "./firebase/client";
import { User } from "firebase/auth";
import { SERVER_URL, categoryMapping, icons } from "./utils/constants";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen";
import customDataProvider from "./utils/customDataProvider";

function App() {
  const [general, setGeneral] = useState<any>({});
  const [loading, setLoading] = useState(true);

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
    axios
      .get(SERVER_URL + "/getTotalStatisticsCount")
      .then((totalStatisticsCount) => {
        setGeneral(totalStatisticsCount.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    onUserChanged(user);
  }, [user]);

  const resources = Object.keys(categoryMapping).map((key, idx) => {
    const Icon = icons[idx];

    if (loading) return { name: "" };
    return {
      name: key,
      list: `/${key}`,
      create: `/${key}/create`,
      edit: `/${key}/edit/:id`,
      meta: {
        icon: <Icon />,
        label: `${categoryMapping[key as keyof typeof categoryMapping]} (${general?.category[key] ?? 0})`,
      },
    };
  });

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  if (loading) return <LoadingScreen />;
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <Refine
          dataProvider={customDataProvider(SERVER_URL, axiosInstance)}
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
              {resources.map((resource: any) => (
                <Route key={resource?.name} path={resource?.name}>
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path="edit/:id" element={<ProjectEdit />} />
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
