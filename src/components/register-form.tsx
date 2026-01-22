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

export default function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
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
                    <form className="space-y-4">
                        <FieldGroup>
                            {/* Role Selection */}
                            <Field>
                                <FieldLabel>Register as</FieldLabel>
                                <Select required>
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

                            {/* Full Name */}
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Full Name
                                </FieldLabel>
                                <Input
                                    id="name"
                                    placeholder="Juan Dela Cruz"
                                    required
                                />
                            </Field>

                            {/* Email */}
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>

                            {/* Password */}
                            <Field>
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <Input id="password" type="password" required />
                            </Field>

                            {/* Confirm Password */}
                            <Field>
                                <FieldLabel htmlFor="confirmPassword">
                                    Confirm Password
                                </FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                />
                            </Field>

                            {/* Actions */}
                            <Field>
                                <Button
                                    type="submit"
                                    className="w-full bg-[#214662] text-white hover:bg-[#214662]/90"
                                >
                                    Create Account
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
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
