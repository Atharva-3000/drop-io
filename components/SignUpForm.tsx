/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

// custom zod schema
import { signUpSchema } from "@/schemas/signUpSchema";
import { FormEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// hero ui imports
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@heroui/react"
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
    // router for redirect after login
    const router = useRouter();

    // submit form and verifying the form at the same time.

    // all states
    const [verifying, setVerifying] = useState(false);

    const { signUp, isLoaded, setActive } = useSignUp();

    // during any submission in the form before otp for otp, and then after otp for otp
    const [isSubmitting, setIsSubmitting] = useState(false);

    // for setting the verification code baing sent in the email
    const [verificationCode, setVerificationCode] = useState("");

    // any errors in the auth, setting this for my own convenience.
    const [authError, setAuthError] = useState<string | null>(null);

    const [verificationError, setVerificationError] = useState<string | null>(null);

    // form submission main states for password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // simple, just read line by line, given by react-hook-forms
    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),

        // giving default values, so it does not throw error on empty fields.
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        }
    })

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if (!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            })

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            })


            setVerifying(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log("Error during SignUp" + error)
            setAuthError(
                error.errors?.[0]?.mesaage || "An error occured during SignUp, Please try again !"
            )
            // throw new Error("Error Signing Up")
        }
        finally {
            setIsSubmitting(false)
        }
    }

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            // console result for better understanding
            console.log(result);
            if (result.status === "complete") {
                await setActive({
                    session: result.createdSessionId
                })

                // redirect to dashboard
                router.push("/dashboard")
            }
            else {
                console.error("Verification incomplete", result);
                setVerificationError(
                    "Verification could not be Completed, Please Try again !"
                )
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Verification Error", error)
            setVerificationError(
                error.errors?.[0]?.mesaage || "An error occured during SignUp, Please try again !"
            )
        }
        finally {
            setIsSubmitting(false);
        }
    }

    if (verifying) {
        return (
            <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
                <CardHeader className="flex flex-col gap-1 items-center pb-2">
                    <h1 className="text-2xl font-bold text-default-900">Verify your Email</h1>
                    <p className="text-default-500 text-center">
                        We&apos;ve sent a verification code to your email. Please Check and enter it Below.
                    </p>
                </CardHeader>
                <Divider />
                <CardBody className="py-6">
                    {verificationError && (
                        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{verificationError}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerificationSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="verificationCode" className="text-sm font-medium text-default-900">
                                Verification Code
                            </label>
                            <Input id="verificationCode" type="text" placeholder="Enter 6-digit code Here" value={verificationCode} onChange={(e) => {
                                setVerificationCode(e.target.value)
                            }} className="w-full" autoFocus
                            />
                        </div>
                        <Button type="submit" color="primary" className="w-full" isLoading={isSubmitting}>
                            {isSubmitting ? "Verifying" : "Verify Email"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-default-500">
                            Didn&apos;t receive a code?{" "}
                            <button onClick={async () => {
                                if (signUp) {
                                    await signUp.prepareEmailAddressVerification({
                                        strategy: "email_code",
                                    });
                                }
                            }}
                                className="text-primary hover:underline font-medium"
                            >
                                Resend Code
                            </button>
                        </p>
                    </div>
                </CardBody>
            </Card>
        )
    }


    // important go through this
    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold text-default-900">
                    Create Your Account
                </h1>
                <p className="text-default-500 text-center">
                    Sign up to start managing your images securely
                </p>
            </CardHeader>

            <Divider />

            <CardBody className="py-6">
                {authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-default-900"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                            {...register("email")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-default-900"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="passwordConfirmation"
                            className="text-sm font-medium text-default-900"
                        >
                            Confirm Password
                        </label>
                        <Input
                            id="passwordConfirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    type="button"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.passwordConfirmation}
                            errorMessage={errors.passwordConfirmation?.message}
                            {...register("passwordConfirmation")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <p className="text-sm text-default-600">
                                By signing up, you agree to our Terms of Service and Privacy
                                Policy
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
            </CardBody>

            <Divider />

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}