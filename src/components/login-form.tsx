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

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
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
                    <form>
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
                                    placeholder="m@example.com"
                                    required
                                    className="border-[#E1DFE1] focus-visible:ring-[#7896AB]"
                                />
                            </Field>

                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel
                                        htmlFor="password"
                                        className="text-[#214662]"
                                    >
                                        Password
                                    </FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm text-[#7896AB] hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="border-[#E1DFE1] focus-visible:ring-[#7896AB]"
                                />
                            </Field>

                            <Field className="flex flex-col gap-3 pt-2">
                                <Button
                                    type="submit"
                                    className="bg-[#214662] hover:bg-[#214662]/90 text-white"
                                >
                                    Login
                                </Button>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="border-[#7896AB] text-[#214662] hover:bg-[#B4C4D0]/30"
                                >
                                    Login with Google
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
