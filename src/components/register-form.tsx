import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { auth, db } from "../firebase/firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [role, setRole] = useState<string>("");
    const [lastName, setLastName] = useState("");
    const [name, setName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!role) {
            toast.error("Please select a role");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            // Create Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            const uid = userCredential.user.uid;

            // Save user data to Firestore
            await setDoc(doc(db, "users", uid), {
                role: role === "doctor" ? "Doctor" : "Pharmacist",
                lastName,
                name,
                middleName,
                email,
                createdAt: serverTimestamp(),
                uid,
            });

            toast.success("Account created successfully!");

            // Optional: redirect after a short delay
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err: any) {
            const errorMessage = err.message || "Failed to create account";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex min-h-screen items-center justify-center bg-[#F8F5F1]",
                className,
            )}
            {...props}
        >
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-[#214662]">
                        Create an account
                    </CardTitle>
                    <CardDescription>
                        Register as a Doctor or Pharmacist to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <FieldGroup>
                            {/* Role */}
                            <Field>
                                <FieldLabel>Register as</FieldLabel>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="doctor">
                                            Doctor
                                        </SelectItem>
                                        <SelectItem value="pharmacist">
                                            Pharmacist
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {/* Last Name */}
                            <Field>
                                <FieldLabel>Last Name</FieldLabel>
                                <Input
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    placeholder="Dela Cruz"
                                    required
                                />
                            </Field>

                            {/* First Name */}
                            <Field>
                                <FieldLabel>First Name</FieldLabel>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan"
                                    required
                                />
                            </Field>

                            {/* Middle Initial */}
                            <Field>
                                <FieldLabel>Middle Name</FieldLabel>
                                <Input
                                    value={middleName}
                                    onChange={(e) =>
                                        setMiddleName(e.target.value)
                                    }
                                    placeholder="Santos"
                                />
                            </Field>

                            {/* Email */}
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Field>

                            {/* Password */}
                            <Field>
                                <FieldLabel>Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </Field>

                            {/* Confirm Password */}
                            <Field>
                                <FieldLabel>Confirm Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </Field>

                            {error && (
                                <p className="text-sm text-red-500 text-center">
                                    {error}
                                </p>
                            )}

                            <Field>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    onClick={handleRegister}
                                    className="w-full bg-[#214662] text-white hover:bg-[#214662]/90"
                                >
                                    {loading
                                        ? "Creating account..."
                                        : "Create Account"}
                                </Button>

                                <FieldDescription className="text-center">
                                    Already have an account?{" "}
                                    <a
                                        href="/login"
                                        className="text-[#214662] underline underline-offset-4"
                                    >
                                        Login
                                    </a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
