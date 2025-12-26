'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const steps = [
    {
        title: "Welcome to RepurposeAI 👋",
        description: "Let's get you set up to dominate your social feeds. In just a few steps, we'll personalize your experience.",
        icon: Sparkles,
        color: "from-blue-500 to-indigo-500"
    },
    {
        title: "What's your main goal?",
        description: "Select the primary reason you're using RepurposeAI.",
        icon: Rocket,
        color: "from-rose-500 to-pink-500",
        options: [
            "Grow Audience",
            "Save Time",
            "Consistency",
            "All of the above"
        ]
    },
    {
        title: "You're all set! 🚀",
        description: "You're ready to start turning your content into viral clips. Let's make some magic happen.",
        icon: Check,
        color: "from-green-500 to-emerald-500"
    }
];

export default function OnboardingWizard() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

    useEffect(() => {
        // Check local storage to see if user has already onboarded
        const hasOnboarded = localStorage.getItem('repurpose_onboarded');
        if (!hasOnboarded) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('repurpose_onboarded', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const StepIcon = steps[currentStep].icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-lg"
                    >
                        <Card className="overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            {/* Header Gradient */}
                            <div className={`h-32 bg-gradient-to-r ${steps[currentStep].color} relative flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-lg relative z-10">
                                    <StepIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-center mb-2">{steps[currentStep].title}</h2>
                                <p className="text-center text-foreground-muted mb-8">{steps[currentStep].description}</p>

                                {/* Step 2: Options */}
                                {currentStep === 1 && (
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {steps[1].options?.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setSelectedGoal(option)}
                                                className={`p-4 rounded-xl border text-sm font-medium transition-all ${selectedGoal === option
                                                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                        : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex gap-2">
                                        {steps.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-border'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleNext}
                                        disabled={currentStep === 1 && !selectedGoal}
                                        className="rounded-full px-6"
                                        rightIcon={currentStep < steps.length - 1 ? <ArrowRight className="w-4 h-4" /> : undefined}
                                    >
                                        {currentStep === steps.length - 1 ? "Let's Go!" : 'Continue'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
