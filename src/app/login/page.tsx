// File: app/login/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/hooks/auth-hooks'
import { loginSchema, type LoginFormData } from '@/lib/schemas'

export default function LoginPage() {
    const login = useLogin()
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: 'emilys',
            password: 'emilyspass'
        }
    })

    const onSubmit = (data: LoginFormData) => {
        login.mutate(data)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                
                {/* Global Error */}
                {login.error && (
                    <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-center">
                        {login.error.message}
                    </div>
                )}

                {/* Username Field */}
                <div className="mb-4">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        {...register('username')}
                        type="text"
                        id="username"
                        disabled={isSubmitting || login.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
                        autoComplete="username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        {...register('password')}
                        type="password"
                        id="password"
                        disabled={isSubmitting || login.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
                        autoComplete="current-password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || login.isPending}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {login.isPending ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}
