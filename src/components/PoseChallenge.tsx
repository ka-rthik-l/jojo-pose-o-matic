'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Zap,
  CheckCircle,
  X,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// Angle calculation helper
const calculateAngle = (A: any, B: any, C: any): number => {
  if (!A || !B || !C) return 0;
  const a = { x: A.x - B.x, y: A.y - B.y };
  const b = { x: C.x - B.x, y: C.y - B.y };
  const dot = a.x * b.x + a.y * b.y;
  const magA = Math.sqrt(a.x * a.x + a.y * a.y);
  const magB = Math.sqrt(b.x * b.x + b.y * b.y);
  if (magA === 0 || magB === 0) return 0;
  const angle = Math.acos(dot / (magA * magB)) * (180 / Math.PI);
  return angle;
};

interface PoseReference {
  name: string;
  description: string;
  keyPoints: {
    leftElbow: number;
    rightElbow: number;
    leftShoulder: number;
    rightShoulder: number;
  };
}

const JOJO_POSES: PoseReference[] = [
  {
    name: 'MENACING STANCE',
    description: 'Raise both arms with elbows bent at 90 degrees',
    keyPoints: { leftElbow: 90, rightElbow: 90, leftShoulder: 45, rightShoulder: 45 },
  },
  {
    name: 'BIZARRE ADVENTURE',
    description: 'Point dramatically with one arm extended',
    keyPoints: { leftElbow: 160, rightElbow: 30, leftShoulder: 0, rightShoulder: 90 },
  },
  {
    name: 'STAND POWER',
    description: 'Cross arms in front of chest',
    keyPoints: { leftElbow: 45, rightElbow: 45, leftShoulder: -30, rightShoulder: 30 },
  },
];

interface PoseChallengeProps {
  isActive: boolean;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

export const PoseChallenge: React.FC<PoseChallengeProps> = ({
  isActive,
  onComplete,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentPose, setCurrentPose] = useState<PoseReference>();
  const [poseDetected, setPoseDetected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [poseHoldTimer, setPoseHoldTimer] = useState(0);
  const POSE_HOLD_DURATION = 30;

  const [isShutdownScreenVisible, setIsShutdownScreenVisible] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMounted = useRef(false);

  const ANGLE_TOLERANCE = 30;

  const checkPoseMatch = (landmarks: any[], targetPose: PoseReference): boolean => {
    if (!landmarks[11] || !landmarks[12] || !landmarks[13] || !landmarks[14]) {
      return false;
    }
    const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
    const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
    const rightShoulderAngle = calculateAngle(landmarks[14], landmarks[12], landmarks[24]);

    return (
      Math.abs(leftElbowAngle - targetPose.keyPoints.leftElbow) < ANGLE_TOLERANCE &&
      Math.abs(rightElbowAngle - targetPose.keyPoints.rightElbow) < ANGLE_TOLERANCE &&
      Math.abs(leftShoulderAngle - targetPose.keyPoints.leftShoulder) < ANGLE_TOLERANCE &&
      Math.abs(rightShoulderAngle - targetPose.keyPoints.rightShoulder) < ANGLE_TOLERANCE
    );
  };

  const onPoseResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !currentPose || !isMounted.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      let poseMatch = false;
      if (results.poseLandmarks) {
        poseMatch = checkPoseMatch(results.poseLandmarks, currentPose);
        setIsPoseCorrect(poseMatch);
        const lineColor = poseMatch ? '#00FF00' : '#FF0000';
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: lineColor,
          lineWidth: 2,
        });
        drawLandmarks(ctx, results.poseLandmarks, { color: '#00FF00', lineWidth: 1 });

        setPoseHoldTimer((prev) => (poseMatch ? prev + 1 : 0));
      } else {
        setIsPoseCorrect(false);
        setPoseHoldTimer(0);
      }

      ctx.restore();
    },
    [currentPose]
  );

  useEffect(() => {
    isMounted.current = true;
    if (!isActive) return;

    const initialize = async () => {
      setIsInitializing(true);
      setCurrentPose(JOJO_POSES[Math.floor(Math.random() * JOJO_POSES.length)]);
      setTimeLeft(60);
      setPoseDetected(false);
      setPoseHoldTimer(0);
      setIsPoseCorrect(false);
      setIsShutdownScreenVisible(false);

      try {
        const video = videoRef.current;
        if (!video) {
          console.error('Video element not found. Aborting initialization.');
          setIsInitializing(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        const pose = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults(onPoseResults);
        poseRef.current = pose;

        const camera = new MediaPipeCamera(video, {
          onFrame: async () => {
            if (poseRef.current && video) {
              await poseRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        setIsInitializing(false);
      } catch (err) {
        console.error('Camera error:', err);
        alert('Could not access camera. Please allow webcam permissions.');
        setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      isMounted.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  }, [isActive, onPoseResults]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isShutdownScreenVisible) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShutdownScreenVisible, onClose]);

  useEffect(() => {
    if (!isMounted.current) return;
    setPoseDetected(poseHoldTimer > POSE_HOLD_DURATION);
  }, [poseHoldTimer]);

  const handleGiveUp = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
    setIsShutdownScreenVisible(true);
  }, []);

  useEffect(() => {
    if (!isActive || poseDetected) return;
    if (timeLeft <= 0) {
      handleGiveUp();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft, poseDetected, handleGiveUp]);

  useEffect(() => {
    if (poseDetected) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      const timeout = setTimeout(() => onComplete(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, [poseDetected, onComplete]);

  const handleClose = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    onClose();
  };

  if (!isActive) return null;

  if (isShutdownScreenVisible) {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-8 font-mono">
        <style>{`
          @keyframes blink {
            50% { opacity: 0; }
          }
          .blinking-cursor::after {
            content: '|';
            animation: blink 1s step-start infinite;
          }
        `}</style>
        <h1 className="text-sm md:text-md blinking-cursor">
          ....
        </h1>
        <p className="absolute bottom-4 right-4 text-xs opacity-50">
          Press ESC to exit
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
        <Card className="max-w-4xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Badge>
              <Zap className="w-4 h-4 mr-1" /> JOJO CHALLENGE
            </Badge>
            <Button variant="ghost" onClick={handleClose}>
              <X />
            </Button>
          </div>

          <h1 className="text-3xl font-bold">{currentPose?.name}</h1>
          <p className="mb-4">{currentPose?.description}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isInitializing ? (
                <div className="flex items-center justify-center h-full text-white">
                  <Camera className="w-10 h-10 mr-2 animate-pulse" />
                  Initializing...
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute w-full h-full"
                  />
                  <Badge
                    className="absolute top-4 right-4"
                    variant={isPoseCorrect ? 'default' : 'destructive'}
                  >
                    {isPoseCorrect ? (
                      <CircleCheck className="mr-1" />
                    ) : (
                      <CircleX className="mr-1" />
                    )}
                    {isPoseCorrect ? 'Pose Match' : 'No Match'}
                  </Badge>
                </>
              )}
              {poseDetected && (
                <div className="absolute inset-0 bg-primary/50 flex flex-col items-center justify-center text-white">
                  <CheckCircle className="w-12 h-12 mb-2 animate-bounce" />
                  <p className="text-2xl font-bold">POSE DETECTED!</p>
                </div>
              )}
            </div>
            <div>
              <ul className="text-muted-foreground mb-4 space-y-2">
                <li>• Position yourself in front of the camera</li>
                <li>• Strike the {currentPose?.name} pose</li>
                <li>• Hold the pose until detected</li>
                <li>• Time left: {timeLeft}s</li>
              </ul>

              <div className="flex gap-4 mt-6">
                <Button onClick={handleGiveUp} className="flex-1">
                  GIVE UP
                </Button>
                <Button onClick={() => onComplete(true)} className="flex-1">
                  FORCE SUCCESS
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};