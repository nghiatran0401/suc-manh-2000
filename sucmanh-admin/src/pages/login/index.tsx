import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { AppIcon } from "../../components/app-icon";
import Link from "antd/lib/typography/Link";
import { AuthService } from "../../firebase/authentication";

export const Login = () => {
  const handleResetPassword = async () => {
    const email = prompt("Type your email here");
    const res = await AuthService.forgotPassword(email ?? "");
    alert(res);
  };
  return (
    <AuthPage
      type="login"
      title={
        <ThemedTitleV2 collapsed={false} text="Sucmanh2000" icon={<AppIcon />} />
      }
      registerLink={false}
      forgotPasswordLink={
        <div
          style={{
            marginTop: 5,
            padding: 5,
          }}
        >
          <Link onClick={handleResetPassword}>Forgot Password</Link>
        </div>
      }
      rememberMe={false}
      formProps={{
        initialValues: { email: "", password: "" },
      }}
    />
  );
};
