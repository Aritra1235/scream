"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Upload, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type OnboardingStep = 'username' | 'displayName' | 'bio' | 'profilePicture' | 'bannerPicture';

interface OnboardingData {
    username: string;
    displayName: string;
    bio: string;
    profilePicture: File | null;
    bannerPicture: File | null;
}

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('username');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [user, setUser] = useState<any>(null);

    const [data, setData] = useState<OnboardingData>({
        username: '',
        displayName: '',
        bio: '',
        profilePicture: null,
        bannerPicture: null
    });

    const [usernameError, setUsernameError] = useState<string>('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const checkIfUserOnboarded = async () => {
            try {
                const session = await authClient.getSession();
                if (!isMounted) return;
                if (!session.data?.session) {
                    router.push("/sign-in");
                    return;
                }

                setUser(session.data.user);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/onboarding/${session.data.user.id}`,
                    {
                        credentials: 'include'
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to check onboarding status');
                }
                const onboardingData = await response.json();
                if (!isMounted) return;
                if (onboardingData.onboarded) {
                    router.push("/home");
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Onboarding check failed:', error);
                    setIsLoading(false);
                }
            }
        };

        checkIfUserOnboarded();

        return () => {
            isMounted = false;
        };
    }, [router]);

    // Debounced username validation
    useEffect(() => {
        if (!data.username.trim()) {
            setUsernameError('');
            return;
        }

        if (data.username.length < 3) {
            setUsernameError('Username must be at least 3 characters long');
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingUsername(true);
            setUsernameError('');

            const isAvailable = await checkUsernameAvailability(data.username);
            if (!isAvailable) {
                setUsernameError('This username is already taken');
            }

            setIsCheckingUsername(false);
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [data.username]);

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/username/${username}`,
                {
                    credentials: 'include'
                }
            );
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            return !result.usernameExists;
        } catch (error) {
            console.error('Username check failed:', error);
            return false;
        }
    };

    const handleUsernameSubmit = async () => {
        if (!data.username.trim()) {
            setUsernameError('Username is required');
            return;
        }

        if (data.username.length < 3) {
            setUsernameError('Username must be at least 3 characters long');
            return;
        }

        if (usernameError) {
            return; // Don't proceed if there's still an error
        }

        if (isCheckingUsername) {
            return; // Don't proceed while still checking
        }

        setCurrentStep('displayName');
    };

    const handleDisplayNameSubmit = async () => {
        if (!data.displayName.trim()) {
            setError('Display name is required');
            return;
        }

        setError('');
        setCurrentStep('bio');
    };

    const handleBioSubmit = async () => {
        setCurrentStep('profilePicture');
    };

    const handleProfilePictureSubmit = () => {
        setCurrentStep('bannerPicture');
    };

    const handleBannerPictureSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            let avatarUrl = null;
            let bannerUrl = null;

            // Upload profile picture if exists
            if (data.profilePicture) {
                avatarUrl = await uploadImage(data.profilePicture, 'avatar');
                if (!avatarUrl) {
                    throw new Error('Failed to upload profile picture');
                }
            }

            // Upload banner picture if exists
            if (data.bannerPicture) {
                bannerUrl = await uploadImage(data.bannerPicture, 'banner');
                if (!bannerUrl) {
                    throw new Error('Failed to upload banner picture');
                }
            }

            // Submit onboarding data
            const onboardingData: any = {
                username: data.username,
                display_name: data.displayName,
                bio: data.bio || null
            };

            // Only include URLs if they exist
            if (avatarUrl) {
                onboardingData.avatar_url = avatarUrl;
            }
            if (bannerUrl) {
                onboardingData.banner_url = bannerUrl;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/onboarding`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(onboardingData)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to complete onboarding');
            }

            router.push('/home');
        } catch (error) {
            console.error('Onboarding completion failed:', error);
            setError('Failed to complete onboarding. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (field: 'profilePicture' | 'bannerPicture') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(prev => ({
                ...prev,
                [field]: file
            }));
        }
    };

    const uploadImage = async (file: File, fileType: 'avatar' | 'banner'): Promise<string | null> => {
        try {
            // Step 1: Get presigned URL
            const presignedResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/upload?fileType=${fileType}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': file.type
                    }
                }
            );

            if (!presignedResponse.ok) {
                throw new Error('Failed to get upload URL');
            }

            const { uploadUrl, objectKey } = await presignedResponse.json();

            // Step 2: Upload file to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to S3');
            }

            // Step 3: Get image dimensions (for now, using placeholder values)
            const img = new Image();
            const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.src = URL.createObjectURL(file);
            });

            // Step 4: Save to database
            const mediaUrl = objectKey;
            const saveResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/upload`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        targetType: 'user',
                        targetId: user?.id || '',
                        userId: user?.id || '',
                        contentType: file.type,
                        type: 'image',
                        mediaUrl,
                        width: dimensions.width,
                        height: dimensions.height
                    })
                }
            );

            if (!saveResponse.ok) {
                throw new Error('Failed to save upload info');
            }

            return mediaUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    const getStepNumber = (step: OnboardingStep): number => {
        const steps = ['username', 'displayName', 'bio', 'profilePicture', 'bannerPicture'];
        return steps.indexOf(step) + 1;
    };

    const getTotalSteps = 5;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-md mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        {(['username', 'displayName', 'bio', 'profilePicture', 'bannerPicture'] as OnboardingStep[]).map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    getStepNumber(currentStep) > index + 1
                                        ? 'bg-primary text-primary-foreground'
                                        : getStepNumber(currentStep) === index + 1
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {getStepNumber(currentStep) > index + 1 ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                {index < 4 && (
                                    <div className={`w-12 h-0.5 mx-2 ${
                                        getStepNumber(currentStep) > index + 1
                                            ? 'bg-primary'
                                            : 'bg-muted'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Step {getStepNumber(currentStep)} of {getTotalSteps}
                    </p>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl">
                            {currentStep === 'username' && 'Choose your username'}
                            {currentStep === 'displayName' && 'What should we call you?'}
                            {currentStep === 'bio' && 'Tell us about yourself'}
                            {currentStep === 'profilePicture' && 'Add a profile picture'}
                            {currentStep === 'bannerPicture' && 'Add a banner picture'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 'username' && 'This will be your unique @username'}
                            {currentStep === 'displayName' && 'This is how others will see your name'}
                            {currentStep === 'bio' && 'Write a short bio (optional)'}
                            {currentStep === 'profilePicture' && 'Upload a profile picture (optional)'}
                            {currentStep === 'bannerPicture' && 'Upload a banner image (optional)'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username Step */}
                        {currentStep === 'username' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                        <Input
                                            id="username"
                                            value={data.username}
                                            onChange={(e) => setData(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                                            className="pl-8"
                                            placeholder="yourusername"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {usernameError && (
                                        <p className="text-xs text-destructive">{usernameError}</p>
                                    )}
                                    {isCheckingUsername && (
                                        <p className="text-xs text-muted-foreground">Checking availability...</p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleUsernameSubmit}
                                    className="w-full"
                                    disabled={isSubmitting || isCheckingUsername || !!usernameError}
                                >
                                    {isCheckingUsername ? 'Checking...' : 'Continue'}
                                    {!isCheckingUsername && !usernameError && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        )}

                        {/* Display Name Step */}
                        {currentStep === 'displayName' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        value={data.displayName}
                                        onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="Your display name"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('username')}
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleDisplayNameSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Bio Step */}
                        {currentStep === 'bio' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell us a bit about yourself..."
                                        className="min-h-[100px] resize-none"
                                        disabled={isSubmitting}
                                        maxLength={160}
                                    />
                                    <div className="text-xs text-muted-foreground text-right">
                                        {data.bio.length}/160
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('displayName')}
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleBioSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Profile Picture Step */}
                        {currentStep === 'profilePicture' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Profile Picture</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                        {data.profilePicture ? (
                                            <div className="space-y-4">
                                                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.profilePicture.name}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('profile-picture')?.click()}
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => document.getElementById('profile-picture')?.click()}
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Photo
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        PNG, JPG up to 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            id="profile-picture"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange('profilePicture')}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('bio')}
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleProfilePictureSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {data.profilePicture ? 'Continue' : 'Skip'}
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Banner Picture Step */}
                        {currentStep === 'bannerPicture' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Banner Picture</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                        {data.bannerPicture ? (
                                            <div className="space-y-4">
                                                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.bannerPicture.name}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('banner-picture')?.click()}
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => document.getElementById('banner-picture')?.click()}
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Banner
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        PNG, JPG up to 5MB (recommended: 1200x400px)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            id="banner-picture"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange('bannerPicture')}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('profilePicture')}
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleBannerPictureSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Completing...' : data.bannerPicture ? 'Complete Setup' : 'Skip & Complete'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
