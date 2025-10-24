"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { toast } from "sonner"

const signupSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function SignupForm({
    open,
    onOpenChange,
}: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const { signup } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
        setIsSubmitting(true)
        try {
            await signup(values.name, values.email, values.password)
            signupForm.reset()
            onOpenChange?.(false)
            toast.success("Signed up successfully")
        } catch (error: any) {
            toast.error(error.message || "Signup failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="hidden sm:flex">
                    Sign up
                </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl">Sign up</DialogTitle>
                    <DialogDescription>
                        Create a new account by filling in the details below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...signupForm}>
                    <form
                        onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                        className="space-y-6"
                        autoComplete="off"
                    >
                        <FormField
                            control={signupForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="John doe"
                                            {...field}
                                            className={signupForm.formState.errors.name ? "ring-red-500 ring-1" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            {...field}
                                            className={signupForm.formState.errors.email ? "ring-red-500 ring-1" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signupForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="******"
                                            {...field}
                                            className={signupForm.formState.errors.password ? "ring-red-500 ring-1" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signupForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="******"
                                            {...field}
                                            className={signupForm.formState.errors.confirmPassword ? "ring-red-500 ring-1" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner />}Sign up</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}