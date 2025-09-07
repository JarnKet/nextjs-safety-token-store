// File: app/dashboard/edit-profile/page-simplified.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useProfile, useUpdateProfile } from '@/hooks/auth-hooks'
import { profileSchema, type ProfileFormData } from '@/lib/schemas'
import { useEffect } from 'react'

export default function EditProfilePageSimplified() {
    const router = useRouter()
    const { data: user, isLoading } = useProfile()
    const updateProfile = useUpdateProfile()
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema)
    })

    // Reset form with user data when loaded
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            })
        }
    }, [user, reset])

    const onSubmit = (data: ProfileFormData) => {
        if (!user) return
        
        updateProfile.mutate(
            { ...data, userId: user.id },
            {
                onSuccess: () => {
                    // Show success message and redirect
                    setTimeout(() => router.push('/dashboard'), 1500)
                }
            }
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-700 mb-4">Please log in to edit your profile.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 bg-white rounded-lg shadow-md w-full max-w-md"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>
                
                {/* Success Message */}
                {updateProfile.isSuccess && (
                    <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded-md text-center">
                        Profile updated successfully! Redirecting...
                    </div>
                )}
                
                {/* Error Message */}
                {updateProfile.error && (
                    <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-center">
                        {updateProfile.error.message}
                    </div>
                )}
                
                {/* First Name */}
                <div className="mb-4">
                    <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        {...register('firstName')}
                        type="text"
                        id="firstName"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                </div>
                
                {/* Last Name */}
                <div className="mb-4">
                    <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        {...register('lastName')}
                        type="text"
                        id="lastName"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                </div>
                
                {/* Email */}
                <div className="mb-6">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>
                
                <div className="space-y-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting || updateProfile.isPending}
                        className="w-full py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
