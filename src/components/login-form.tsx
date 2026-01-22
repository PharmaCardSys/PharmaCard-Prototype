import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Logged in successfully");
            navigate("/");
        } catch (error) {
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="bg-white border-[#E1DFE1] shadow-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-[#214662] text-2xl">
                        Login to your account
                    </CardTitle>
                    <CardDescription className="text-[#214662]/70">
                        Enter your email below to access PharmaCard
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel
                                    htmlFor="email"
                                    className="text-[#214662]"
                                >
                                    Email
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="m@example.com"
                                    required
                                    className="border-[#E1DFE1] focus-visible:ring-[#7896AB]"
                                />
                            </Field>

                            <Field>
                                <FieldLabel
                                    htmlFor="password"
                                    className="text-[#214662]"
                                >
                                    Password
                                </FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="border-[#E1DFE1] focus-visible:ring-[#7896AB]"
                                />
                            </Field>

                            <Field className="flex flex-col gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#214662] hover:bg-[#214662]/90 text-white"
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </Button>

                                <FieldDescription className="text-center text-[#214662]/70">
                                    Don&apos;t have an account?{" "}
                                    <a
                                        href="/register"
                                        className="text-[#214662] font-medium hover:underline"
                                    >
                                        Sign up
                                    </a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
