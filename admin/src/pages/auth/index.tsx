import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";

export const Login = () => {
  return <AuthPage type="login" title={<ThemedTitleV2 collapsed={false} text="Sức Mạnh 2000" />} registerLink={false} forgotPasswordLink={false} />;
};
