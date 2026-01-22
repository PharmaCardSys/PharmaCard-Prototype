import { LoginForm } from "../components/login-form";

export default function Login() {
    return (
        <>
            <div className="w-full min-h-screen bg-[#F8F5F1] text-[#214662] flex flex-col items-center justify-center">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </>
    );
}
