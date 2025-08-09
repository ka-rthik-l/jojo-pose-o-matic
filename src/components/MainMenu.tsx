import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PoseChallenge } from './PoseChallenge';
import { Zap, Eye, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jojoLeftPose from '@/assets/jojo-pose-left.png';
import jojoRightPose from '@/assets/jojo-pose-right.png';

export const MainMenu: React.FC = () => {
  const [challengeActive, setChallengeActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [nextChallengeIn, setNextChallengeIn] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const { toast } = useToast();

  // Random challenge timer
  useEffect(() => {
    if (!autoMode) return;

    const startRandomTimer = () => {
      // Random interval between 1-5 minutes (demo: 10-30 seconds)
      const randomInterval = Math.floor(Math.random() * 20000) + 10000;
      setNextChallengeIn(Math.floor(randomInterval / 1000));
      setIsWaiting(true);

      const countdown = setInterval(() => {
        setNextChallengeIn(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setChallengeActive(true);
            setIsWaiting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return countdown;
    };

    const timer = startRandomTimer();
    return () => clearInterval(timer);
  }, [autoMode, challengeActive]);

  const handleChallengeComplete = (success: boolean) => {
    setChallengeActive(false);
    
    if (success) {
      toast({
        title: "CHALLENGE COMPLETED!",
        description: "You have proven yourself worthy of the JoJo spirit!",
        duration: 3000,
      });
    } else {
      toast({
        title: "CHALLENGE FAILED!",
        description: "In the original version, this would trigger system shutdown...",
        variant: "destructive",
        duration: 5000,
      });
    }

    // Restart auto mode timer if enabled
    if (autoMode) {
      setTimeout(() => {
        // Timer will restart due to useEffect dependency
      }, 2000);
    }
  };

  const handleCloseChallenge = () => {
    setChallengeActive(false);
    setIsWaiting(false);
    if (autoMode) setAutoMode(false);
  };

  const startManualChallenge = () => {
    setChallengeActive(true);
  };

  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
    if (!autoMode) {
      toast({
        title: "AUTO MODE ACTIVATED",
        description: "Random challenges will now appear every 10-30 seconds",
        duration: 3000,
      });
    } else {
      setIsWaiting(false);
      setNextChallengeIn(0);
      toast({
        title: "AUTO MODE DEACTIVATED",
        description: "No more random challenges",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Left JoJo Pose */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <img 
            src={`${jojoLeftPose}?v=${Date.now()}`}
            alt="JoJo Character Left" 
            className="h-full max-h-screen object-contain opacity-30 hover:opacity-50 transition-opacity duration-300"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          />
        </div>
        
        {/* Right JoJo Pose */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <img 
            src={`${jojoRightPose}?v=${Date.now()}`}
            alt="JoJo Character Right" 
            className="h-full max-h-screen object-contain opacity-30 hover:opacity-50 transition-opacity duration-300"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          />
        </div>

        <Card className="w-full max-w-2xl p-8 aura-effect relative z-10">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Zap className="w-16 h-16 mx-auto mb-4 text-primary animate-menacing-pulse" />
              <h1 className="text-5xl font-black text-menacing mb-2">
                JOJO POSE
              </h1>
              <h2 className="text-3xl font-bold text-accent">
                DETECTION CHALLENGE
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Test your ability to strike the perfect JoJo pose under pressure!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card/50 p-4 rounded-lg border border-primary/30">
                <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Real-time Detection</p>
                <p className="text-sm text-muted-foreground">Live webcam analysis</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-accent/30">
                <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="font-semibold">15 Second Timer</p>
                <p className="text-sm text-muted-foreground">Strike the pose fast</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg border border-destructive/30">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <p className="font-semibold">High Stakes</p>
                <p className="text-sm text-muted-foreground">Failure has consequences</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="menacing"
              size="hero"
              onClick={startManualChallenge}
              className="w-full"
              disabled={challengeActive || isWaiting}
            >
              START MANUAL CHALLENGE
            </Button>

            <div className="relative">
              <Button
                variant={autoMode ? "destructive" : "aura"}
                size="hero"
                onClick={toggleAutoMode}
                className="w-full"
                disabled={challengeActive}
              >
                {autoMode ? "STOP AUTO MODE" : "START AUTO MODE"}
              </Button>
              
              {isWaiting && (
                <Badge 
                  variant="outline" 
                  className="absolute -top-2 -right-2 text-xs animate-pulse"
                >
                  Next in {nextChallengeIn}s
                </Badge>
              )}
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive mb-1">Safety Notice</p>
                  <p className="text-sm text-muted-foreground">
                    This is a demo version. The original concept included system shutdown on failure, 
                    but this version is completely safe for testing. No actual system commands are executed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <PoseChallenge
        isActive={challengeActive}
        onComplete={handleChallengeComplete}
        onClose={handleCloseChallenge}
      />
    </>
  );
};