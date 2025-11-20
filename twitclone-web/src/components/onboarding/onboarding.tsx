"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Upload, User, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner"; 

type OnboardingStep = 'username' | 'displayName' | 'bio' | 'images';

interface OnboardingData {
    username: string;
    displayName: string;
    bio: string;
    profilePictureUrl: string | null; 
    bannerPictureUrl: string | null; 
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
        profilePictureUrl: null,
        bannerPictureUrl: null
    });

    // State for username validation
    const [usernameError, setUsernameError] = useState<string>('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // State for image previews and individual upload loading
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);


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
    }, []);

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
        setCurrentStep('images'); // Go to the new combined image step
    };

    // New handler for the final submission from the image step
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            // Images are already uploaded. We just need to send the URLs.
            const onboardingData: any = {
                username: data.username,
                display_name: data.displayName,
                bio: data.bio || null,
                avatar_url: data.profilePictureUrl || null,
                banner_url: data.bannerPictureUrl || null,
            };

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

    // New file change handler that uploads immediately
    const handleFileChange = (field: 'profilePicture' | 'bannerPicture') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isAvatar = field === 'profilePicture';
        const previewUrl = URL.createObjectURL(file);

        if (isAvatar) {
            setAvatarPreview(previewUrl);
            setIsUploadingAvatar(true);
        } else {
            setBannerPreview(previewUrl);
            setIsUploadingBanner(true);
        }

        setError(''); // Clear previous errors

        try {
            const uploadedUrl = await uploadImage(file, isAvatar ? 'avatar' : 'banner');

            if (uploadedUrl) {
                if (isAvatar) {
                    setData(prev => ({ ...prev, profilePictureUrl: uploadedUrl }));
                } else {
                    setData(prev => ({ ...prev, bannerPictureUrl: uploadedUrl }));
                }
            } else {
                throw new Error('Upload returned no URL');
            }
        } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            setError(`Failed to upload ${isAvatar ? 'profile picture' : 'banner'}. Please try again.`);
            // Clear the failed preview
            if (isAvatar) {
                setAvatarPreview(null);
            } else {
                setBannerPreview(null);
            }
        } finally {
            if (isAvatar) {
                setIsUploadingAvatar(false);
            } else {
                setIsUploadingBanner(false);
            }
            // Revoke the object URL after a short delay to ensure image has rendered
            setTimeout(() => URL.revokeObjectURL(previewUrl), 1000);
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

            // Step 3: Get image dimensions
            const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = () => resolve({ width: 0, height: 0 }); // Handle error
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
        const steps = ['username', 'displayName', 'bio', 'images'];
        return steps.indexOf(step) + 1;
    };

    const getTotalSteps = 4; // Updated total steps

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <Spinner className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2 max-w-sm mx-auto">
                        {(['username', 'displayName', 'bio', 'images'] as OnboardingStep[]).map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                    getStepNumber(currentStep) > index + 1
                                        ? 'bg-primary text-primary-foreground'
                                        : getStepNumber(currentStep) === index + 1
                                        ? 'bg-primary text-primary-foreground scale-110'
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {getStepNumber(currentStep) > index + 1 ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                {index < getTotalSteps - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${
                                        getStepNumber(currentStep) > index + 1
                                            ? 'bg-primary'
                                            : 'bg-muted'
                                    }`} style={{ minWidth: '40px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Step {getStepNumber(currentStep)} of {getTotalSteps}
                    </p>
                </div>

                <Card className="shadow-2xl shadow-primary/5 border-0 bg-card">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl text-foreground">
                            {currentStep === 'username' && 'Choose your username'}
                            {currentStep === 'displayName' && 'What should we call you?'}
                            {currentStep === 'bio' && 'Tell us about yourself'}
                            {currentStep === 'images' && 'Customize your profile'}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {currentStep === 'username' && 'This will be your unique @username'}
                            {currentStep === 'displayName' && 'This is how others will see your name'}
                            {currentStep === 'bio' && 'Write a short bio (optional)'}
                            {currentStep === 'images' && 'Upload a profile and banner picture (optional)'}
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
                                    <Label htmlFor="username" className="text-foreground">Username</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">@</span>
                                        <Input
                                            id="username"
                                            value={data.username}
                                            onChange={(e) => setData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                            className="pl-8 bg-background text-foreground"
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
                                <div className="pt-10">
                                    <Button
                                        onClick={handleUsernameSubmit}
                                        className="w-full"
                                        disabled={isSubmitting || isCheckingUsername || !!usernameError || data.username.length < 3}
                                    >
                                        {isCheckingUsername ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                        {isCheckingUsername ? 'Checking...' : 'Continue'}
                                        {!isCheckingUsername && <ChevronRight className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Display Name Step */}
                        {currentStep === 'displayName' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        value={data.displayName}
                                        onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="Your display name"
                                        disabled={isSubmitting}
                                        className="bg-background text-foreground"
                                    />
                                </div>
                                <div className="flex gap-2 pt-10">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('username')}
                                        disabled={isSubmitting}
                                        className="border-border text-foreground hover:bg-accent"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleDisplayNameSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting || !data.displayName.trim()}
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
                                    <Label htmlFor="bio" className="text-foreground">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell us a bit about yourself..."
                                        className="min-h-[100px] resize-none bg-background text-foreground"
                                        disabled={isSubmitting}
                                        maxLength={160}
                                    />
                                    <div className="text-xs text-muted-foreground text-right">
                                        {data.bio.length}/160
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-10">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('displayName')}
                                        disabled={isSubmitting}
                                        className="border-border text-foreground hover:bg-accent"
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

                        {/* NEW Images Step */}
                        {currentStep === 'images' && (
                            <div className="space-y-6">
                                {/* Profile Preview */}
                                <div className="relative w-full">
                                    {/* Banner Area */}
                                    <label htmlFor="banner-picture" className="cursor-pointer">
                                        <div className="relative h-36 w-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted/70 transition-all rounded-lg overflow-hidden border-2 border-border">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="w-8 h-8 mx-auto text-foreground" />
                                                    <span className="text-xs text-foreground font-medium">Upload Banner</span>
                                                </div>
                                            )}
                                            {isUploadingBanner && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Spinner className="text-white h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                    </label>

                                    {/* Avatar Area - Now a sibling to the label, will overlay without being clipped */}
                                    <div className="absolute top-24 left-4">
                                        <label htmlFor="profile-picture" className="cursor-pointer">
                                            <div className="relative w-24 h-24 rounded-full bg-muted border-4 border-card flex items-center justify-center text-foreground overflow-hidden hover:opacity-90 transition-all shadow-lg">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-10 h-10 text-foreground" />
                                                )}
                                                {isUploadingAvatar && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Spinner className="text-white h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Hidden File Inputs */}
                                <input
                                    id="profile-picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange('profilePicture')}
                                    disabled={isUploadingAvatar}
                                />
                                <input
                                    id="banner-picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange('bannerPicture')}
                                    disabled={isUploadingBanner}
                                />

                                {/* Navigation */}
                                <div className="flex gap-2 pt-10">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep('bio')}
                                        disabled={isSubmitting || isUploadingAvatar || isUploadingBanner}
                                        className="border-border text-foreground hover:bg-accent"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleFinalSubmit}
                                        className="flex-1"
                                        disabled={isSubmitting || isUploadingAvatar || isUploadingBanner}
                                    >
                                        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                        {isSubmitting ? 'Completing...' : 'Complete Setup'}
                                        {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
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