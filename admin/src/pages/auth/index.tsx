import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { AppIcon } from "../../components/app-icon";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title={<ThemedTitleV2 collapsed={false} text="Sức Mạnh 2000" icon={<AppIcon />} />}
      registerLink={false}
      forgotPasswordLink={false}
      // rememberMe={true}
      // formProps={{
      //   initialValues: { email: "", password: "" },
      // }}
    />
  );
};
