// // // "use client";

// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { Button } from '@/components/ui/button';
// // // import { Card } from '@/components/ui/card';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Camera, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';
// // // import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
// // // import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
// // // import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// // // // Helper function to calculate the angle between three points.
// // // // This is essential for determining if a pose is correct.
// // // const calculateAngle = (A: any, B: any, C: any): number => {
// // //   if (!A || !B || !C) return 0;
// // //   const a = { x: A.x - B.x, y: A.y - B.y };
// // //   // FIX: The y-component of vector b was incorrectly using B.x. It should be B.y.
// // //   const b = { x: C.x - B.x, y: C.y - B.y };
// // //   const dot = a.x * b.x + a.y * b.y;
// // //   const magA = Math.sqrt(a.x * a.x + a.y * a.y);
// // //   const magB = Math.sqrt(b.x * b.x + b.y * b.y);

// // //   // Return 0 if either magnitude is zero to prevent division by zero.
// // //   if (magA === 0 || magB === 0) return 0;

// // //   const angle = Math.acos(dot / (magA * magB)) * (180 / Math.PI);
// // //   return angle;
// // // };

// // // // Interface for a specific pose, now including a hold duration.
// // // interface PoseReference {
// // //   name: string;
// // //   description: string;
// // //   keyPoints: {
// // //     leftElbow: number;
// // //     rightElbow: number;
// // //     leftShoulder: number;
// // //     rightShoulder: number;
// // //   };
// // // }

// // // const JOJO_POSES: PoseReference[] = [
// // //   {
// // //     name: "MENACING STANCE",
// // //     description: "Raise both arms with elbows bent at 90 degrees",
// // //     keyPoints: { leftElbow: 90, rightElbow: 90, leftShoulder: 45, rightShoulder: 45 }
// // //   },
// // //   {
// // //     name: "BIZARRE ADVENTURE",
// // //     description: "Point dramatically with one arm extended",
// // //     keyPoints: { leftElbow: 160, rightElbow: 30, leftShoulder: 0, rightShoulder: 90 }
// // //   },
// // //   {
// // //     name: "STAND POWER",
// // //     description: "Cross arms in front of chest",
// // //     keyPoints: { leftElbow: 45, rightElbow: 45, leftShoulder: -30, rightShoulder: 30 }
// // //   }
// // // ];

// // // interface PoseChallengeProps {
// // //   isActive: boolean;
// // //   onComplete: (success: boolean) => void;
// // //   onClose: () => void;
// // // }

// // // export const PoseChallenge: React.FC<PoseChallengeProps> = ({
// // //   isActive,
// // //   onComplete,
// // //   onClose
// // // }) => {
// // //   const [timeLeft, setTimeLeft] = useState(200);
// // //   const [currentPose, setCurrentPose] = useState<PoseReference>();
// // //   const [poseDetected, setPoseDetected] = useState(false);
// // //   const [isInitializing, setIsInitializing] = useState(true);
// // //   const [cameraReady, setCameraReady] = useState(false);
  
// // //   // State to track the hold timer to prevent flickering.
// // //   const [poseHoldTimer, setPoseHoldTimer] = useState(0);
// // //   const POSE_HOLD_DURATION = 30; // Number of frames to hold the pose.

// // //   const videoRef = useRef<HTMLVideoElement>(null);
// // //   const canvasRef = useRef<HTMLCanvasElement>(null);
// // //   const poseRef = useRef<Pose | null>(null);
// // //   const cameraRef = useRef<MediaPipeCamera | null>(null);
// // //   const streamRef = useRef<MediaStream | null>(null);
// // //   const isMounted = useRef(false);

// // //   const checkPoseMatch = (landmarks: any[], targetPose: PoseReference): boolean => {
// // //     // Check if key landmarks are present before calculating angles.
// // //     if (!landmarks[11] || !landmarks[12] || !landmarks[13] || !landmarks[14]) {
// // //       return false;
// // //     }
  
// // //     // Calculate angles of the left elbow, right elbow, and shoulders.
// // //     const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
// // //     const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
// // //     const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
// // //     const rightShoulderAngle = calculateAngle(landmarks[14], landmarks[12], landmarks[24]);
  
// // //     const angleTolerance = 25; // Tolerance in degrees for matching angles.
  
// // //     const leftElbowMatch = Math.abs(leftElbowAngle - targetPose.keyPoints.leftElbow) < angleTolerance;
// // //     const rightElbowMatch = Math.abs(rightElbowAngle - targetPose.keyPoints.rightElbow) < angleTolerance;
// // //     const leftShoulderMatch = Math.abs(leftShoulderAngle - targetPose.keyPoints.leftShoulder) < angleTolerance;
// // //     const rightShoulderMatch = Math.abs(rightShoulderAngle - targetPose.keyPoints.rightShoulder) < angleTolerance;
  
// // //     // A pose is considered a match if all key angles are within the tolerance.
// // //     return leftElbowMatch && rightElbowMatch && leftShoulderMatch && rightShoulderMatch;
// // //   };

// // //   const onPoseResults = useCallback((results: any) => {
// // //     const canvasElement = canvasRef.current;
// // //     const videoElement = videoRef.current;
// // //     if (!canvasElement || !videoElement || !currentPose || !isMounted.current) return;

// // //     const canvasCtx = canvasElement.getContext('2d');
// // //     if (!canvasCtx) return;

// // //     canvasCtx.save();
// // //     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
// // //     canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

// // //     if (results.poseLandmarks) {
// // //       const isPoseCorrect = checkPoseMatch(results.poseLandmarks, currentPose);

// // //       // Draw the pose on the canvas. Use a different color if the pose is correct.
// // //       const lineColor = isPoseCorrect ? '#00FF00' : '#FF0000';
// // //       drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: lineColor, lineWidth: 2 });
// // //       drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#00FF00', lineWidth: 1 });

// // //       if (isPoseCorrect) {
// // //         setPoseHoldTimer(prev => prev + 1);
// // //       } else {
// // //         setPoseHoldTimer(0);
// // //       }

// // //     } else {
// // //       setPoseHoldTimer(0);
// // //     }
    
// // //     canvasCtx.restore();
// // //   }, [currentPose]);
  
// // //   // Effect to handle the camera and pose detection lifecycle
// // //   useEffect(() => {
// // //     isMounted.current = true;
    
// // //     if (!isActive) {
// // //       if (streamRef.current) {
// // //         streamRef.current.getTracks().forEach(track => track.stop());
// // //         streamRef.current = null;
// // //       }
// // //       if (cameraRef.current) {
// // //         cameraRef.current.stop();
// // //         cameraRef.current = null;
// // //       }
// // //       if (poseRef.current) {
// // //         poseRef.current.close();
// // //         poseRef.current = null;
// // //       }
// // //       return () => { isMounted.current = false; };
// // //     }

// // //     const initialize = async () => {
// // //       setIsInitializing(true);
// // //       setCurrentPose(JOJO_POSES[Math.floor(Math.random() * JOJO_POSES.length)]);
// // //       setTimeLeft(200);
// // //       setPoseDetected(false);
// // //       setPoseHoldTimer(0);
      
// // //       try {
// // //         const videoElement = videoRef.current;
// // //         if (!videoElement) {
// // //           console.error('Video element not found. Aborting initialization.');
// // //           if (isMounted.current) setIsInitializing(false);
// // //           return;
// // //         }

// // //         const stream = await navigator.mediaDevices.getUserMedia({
// // //           video: { width: 640, height: 480 }
// // //         });

// // //         streamRef.current = stream;
// // //         videoElement.srcObject = stream;
        
// // //         await videoElement.play();

// // //         const pose = new Pose({
// // //           locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
// // //         });
        
// // //         pose.setOptions({
// // //           modelComplexity: 1,
// // //           smoothLandmarks: true,
// // //           enableSegmentation: false,
// // //           smoothSegmentation: false,
// // //           minDetectionConfidence: 0.5,
// // //           minTrackingConfidence: 0.5,
// // //         });
        
// // //         pose.onResults(onPoseResults);
// // //         poseRef.current = pose;

// // //         const camera = new MediaPipeCamera(videoElement, {
// // //           onFrame: async () => {
// // //             if (isMounted.current && poseRef.current && videoElement) {
// // //               await poseRef.current.send({ image: videoElement });
// // //             }
// // //           },
// // //           width: 640,
// // //           height: 480,
// // //         });
        
// // //         cameraRef.current = camera;
// // //         await camera.start();
        
// // //         if (isMounted.current) {
// // //             setCameraReady(true);
// // //             setIsInitializing(false);
// // //         }
// // //       } catch (error) {
// // //         console.error('Failed to initialize pose detection:', error);
// // //         if (isMounted.current) {
// // //             setIsInitializing(false);
// // //         }
// // //         alert('Could not access the webcam. Please ensure you have granted permission.');
// // //       }
// // //     };

// // //     initialize();

// // //     return () => {
// // //       isMounted.current = false;
// // //       if (streamRef.current) {
// // //         streamRef.current.getTracks().forEach(track => track.stop());
// // //         streamRef.current = null;
// // //       }
// // //       if (cameraRef.current) {
// // //         cameraRef.current.stop();
// // //         cameraRef.current = null;
// // //       }
// // //       if (poseRef.current) {
// // //         poseRef.current.close();
// // //         poseRef.current = null;
// // //       }
// // //     };
// // //   }, [isActive, onPoseResults]);

// // //   // Effect to check if the pose has been held long enough.
// // //   useEffect(() => {
// // //     // We also check if the component is mounted to prevent errors.
// // //     if (!isMounted.current) return;
// // //     if (poseHoldTimer > POSE_HOLD_DURATION) {
// // //       setPoseDetected(true);
// // //     } else {
// // //       setPoseDetected(false);
// // //     }
// // //   }, [poseHoldTimer]); // Removed onComplete dependency here to prevent infinite loops.

// // //   // Timer logic for the countdown.
// // //   useEffect(() => {
// // //     if (!isActive || timeLeft <= 0 || poseDetected) return;
// // //     const timer = setInterval(() => {
// // //       setTimeLeft(prev => {
// // //         if (prev <= 1) {
// // //           onComplete(false);
// // //           return 0;
// // //         }
// // //         return prev - 1;
// // //       });
// // //     }, 1000);
// // //     return () => clearInterval(timer);
// // //   }, [isActive, timeLeft, onComplete, poseDetected]);

// // //   // Trigger onComplete when pose is detected and held.
// // //   useEffect(() => {
// // //     if (poseDetected) {
// // //       const successTimer = setTimeout(() => onComplete(true), 1000);
// // //       return () => clearTimeout(successTimer);
// // //     }
// // //   }, [poseDetected, onComplete]);

// // //   if (!isActive) return null;

// // //   return (
// // //     <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
// // //       <Card className="w-full max-w-4xl mx-4 p-8 aura-effect dramatic-entrance">
// // //         <div className="text-center mb-6">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <Badge variant="outline" className="text-lg px-4 py-2">
// // //               <Zap className="w-5 h-5 mr-2" />
// // //               JOJO CHALLENGE
// // //             </Badge>
// // //             <Button
// // //               variant="ghost"
// // //               size="icon"
// // //               onClick={onClose}
// // //               className="hover:bg-destructive/20"
// // //             >
// // //               <X className="w-6 h-6" />
// // //             </Button>
// // //           </div>
// // //           <h1 className="text-4xl font-black text-menacing mb-2">
// // //             {currentPose?.name || "LOADING..."}
// // //           </h1>
// // //           <p className="text-xl text-muted-foreground mb-4">
// // //             {currentPose?.description || "Preparing challenge..."}
// // //           </p>
// // //           <div className="flex items-center justify-center gap-4 mb-6">
// // //             <div className={`text-6xl font-black ${timeLeft <= 5 ? 'text-destructive animate-countdown-pulse' : 'text-primary'}`}>
// // //               {timeLeft}
// // //             </div>
// // //             <div className="text-lg text-muted-foreground">seconds</div>
// // //           </div>
// // //         </div>
// // //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// // //           <div className="relative">
// // //             <div className="aspect-video bg-card rounded-lg overflow-hidden border-2 border-primary/30">
// // //               {isInitializing ? (
// // //                 <div className="flex items-center justify-center h-full">
// // //                   <div className="text-center">
// // //                     <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
// // //                     <p className="text-lg">Initializing camera...</p>
// // //                   </div>
// // //                 </div>
// // //               ) : (
// // //                 <div className="relative w-full h-full">
// // //                   <video
// // //                     ref={videoRef}
// // //                     className="absolute w-full h-full object-cover transform scaleX(-1)"
// // //                     autoPlay
// // //                     muted
// // //                     playsInline
// // //                   />
// // //                   <canvas
// // //                     ref={canvasRef}
// // //                     width={640}
// // //                     height={480}
// // //                     className="absolute w-full h-full"
// // //                   />
// // //                 </div>
// // //               )}
// // //             </div>
// // //             {poseDetected && (
// // //               <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg">
// // //                 <div className="text-center text-primary-foreground">
// // //                   <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
// // //                   <p className="text-2xl font-bold">POSE DETECTED!</p>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </div>
// // //           <div className="space-y-6">
// // //             <div className="bg-card/50 p-6 rounded-lg border border-primary/30">
// // //               <h3 className="text-xl font-bold mb-4 flex items-center">
// // //                 <AlertTriangle className="w-6 h-6 mr-2 text-accent" />
// // //                 INSTRUCTIONS
// // //               </h3>
// // //               <ul className="space-y-2 text-muted-foreground">
// // //                 <li>• Position yourself in front of the camera</li>
// // //                 <li>• Strike the {currentPose?.name} pose</li>
// // //                 <li>• Hold the pose until detected</li>
// // //                 <li>• You have {timeLeft} seconds remaining</li>
// // //               </ul>
// // //             </div>
// // //             <div className="bg-accent/10 p-6 rounded-lg border border-accent/30">
// // //               <h3 className="text-lg font-bold mb-2 text-accent">WARNING</h3>
// // //               <p className="text-sm text-muted-foreground">
// // //                 This is a demo version. In the original concept, failure to complete 
// // //                 the challenge would trigger system actions. This version is safe for testing.
// // //               </p>
// // //             </div>
// // //             <div className="flex gap-4">
// // //               <Button variant="dramatic" size="challenge" onClick={() => onComplete(false)} className="flex-1">
// // //                 GIVE UP
// // //               </Button>
// // //               <Button variant="menacing" size="challenge" onClick={() => onComplete(true)} className="flex-1">
// // //                 FORCE SUCCESS
// // //               </Button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </Card>
// // //     </div>
// // //   );
// // // };

// // "use client";

// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Card } from '@/components/ui/card';
// // import { Badge } from '@/components/ui/badge';
// // import { Camera, Zap, AlertTriangle, CheckCircle, X, CircleCheck, CircleX } from 'lucide-react';
// // import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
// // import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
// // import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// // // Helper function to calculate the angle between three points.
// // const calculateAngle = (A: any, B: any, C: any): number => {
// //     if (!A || !B || !C) return 0;
// //     const a = { x: A.x - B.x, y: A.y - B.y };
// //     // FIX: The y-component of vector b was incorrectly using B.x. It should be B.y.
// //     const b = { x: C.x - B.x, y: C.y - B.y };
// //     const dot = a.x * b.x + a.y * b.y;
// //     const magA = Math.sqrt(a.x * a.x + a.y * a.y);
// //     const magB = Math.sqrt(b.x * b.x + b.y * b.y);

// //     if (magA === 0 || magB === 0) return 0;

// //     const angle = Math.acos(dot / (magA * magB)) * (180 / Math.PI);
// //     return angle;
// // };

// // // Interface for a specific pose, now including a hold duration.
// // interface PoseReference {
// //     name: string;
// //     description: string;
// //     keyPoints: {
// //         leftElbow: number;
// //         rightElbow: number;
// //         leftShoulder: number;
// //         rightShoulder: number;
// //     };
// // }

// // const JOJO_POSES: PoseReference[] = [
// //     {
// //         name: "MENACING STANCE",
// //         description: "Raise both arms with elbows bent at 90 degrees",
// //         keyPoints: { leftElbow: 90, rightElbow: 90, leftShoulder: 45, rightShoulder: 45 }
// //     },
// //     {
// //         name: "BIZARRE ADVENTURE",
// //         description: "Point dramatically with one arm extended",
// //         keyPoints: { leftElbow: 160, rightElbow: 30, leftShoulder: 0, rightShoulder: 90 }
// //     },
// //     {
// //         name: "STAND POWER",
// //         description: "Cross arms in front of chest",
// //         keyPoints: { leftElbow: 45, rightElbow: 45, leftShoulder: -30, rightShoulder: 30 }
// //     }
// // ];

// // interface PoseChallengeProps {
// //     isActive: boolean;
// //     onComplete: (success: boolean) => void;
// //     onClose: () => void;
// // }

// // export const PoseChallenge: React.FC<PoseChallengeProps> = ({
// //     isActive,
// //     onComplete,
// //     onClose
// // }) => {
// //     const [timeLeft, setTimeLeft] = useState(200);
// //     const [currentPose, setCurrentPose] = useState<PoseReference>();
// //     const [poseDetected, setPoseDetected] = useState(false);
// //     const [isInitializing, setIsInitializing] = useState(true);
// //     const [cameraReady, setCameraReady] = useState(false);
// //     const [isPoseCorrect, setIsPoseCorrect] = useState(false); // New state for indicator

// //     // State to track the hold timer to prevent flickering.
// //     const [poseHoldTimer, setPoseHoldTimer] = useState(0);
// //     const POSE_HOLD_DURATION = 30; // Number of frames to hold the pose.

// //     const videoRef = useRef<HTMLVideoElement>(null);
// //     const canvasRef = useRef<HTMLCanvasElement>(null);
// //     const poseRef = useRef<Pose | null>(null);
// //     const cameraRef = useRef<MediaPipeCamera | null>(null);
// //     const streamRef = useRef<MediaStream | null>(null);
// //     const isMounted = useRef(false);

// //     const checkPoseMatch = (landmarks: any[], targetPose: PoseReference): boolean => {
// //         // Check if key landmarks are present before calculating angles.
// //         if (!landmarks[11] || !landmarks[12] || !landmarks[13] || !landmarks[14]) {
// //             return false;
// //         }

// //         // Calculate angles of the left elbow, right elbow, and shoulders.
// //         // FIX: Replaced incorrect landmark mappings for more accurate angles.
// //         const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
// //         const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
// //         const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
// //         const rightShoulderAngle = calculateAngle(landmarks[14], landmarks[12], landmarks[24]);

// //         const angleTolerance = 25; // Tolerance in degrees for matching angles.

// //         const leftElbowMatch = Math.abs(leftElbowAngle - targetPose.keyPoints.leftElbow) < angleTolerance;
// //         const rightElbowMatch = Math.abs(rightElbowAngle - targetPose.keyPoints.rightElbow) < angleTolerance;
// //         const leftShoulderMatch = Math.abs(leftShoulderAngle - targetPose.keyPoints.leftShoulder) < angleTolerance;
// //         const rightShoulderMatch = Math.abs(rightShoulderAngle - targetPose.keyPoints.rightShoulder) < angleTolerance;

// //         // A pose is considered a match if all key angles are within the tolerance.
// //         return leftElbowMatch && rightElbowMatch && leftShoulderMatch && rightShoulderMatch;
// //     };

// //     const onPoseResults = useCallback((results: any) => {
// //         const canvasElement = canvasRef.current;
// //         const videoElement = videoRef.current;
// //         if (!canvasElement || !videoElement || !currentPose || !isMounted.current) return;

// //         const canvasCtx = canvasElement.getContext('2d');
// //         if (!canvasCtx) return;

// //         canvasCtx.save();
// //         canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
// //         canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

// //         let poseMatch = false;
// //         if (results.poseLandmarks) {
// //             poseMatch = checkPoseMatch(results.poseLandmarks, currentPose);
// //             setIsPoseCorrect(poseMatch); // Update new state for the indicator

// //             const lineColor = poseMatch ? '#00FF00' : '#FF0000';
// //             drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: lineColor, lineWidth: 2 });
// //             drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#00FF00', lineWidth: 1 });

// //             if (poseMatch) {
// //                 setPoseHoldTimer(prev => prev + 1);
// //             } else {
// //                 setPoseHoldTimer(0);
// //             }
// //         } else {
// //             setIsPoseCorrect(false); // No landmarks, so no pose match
// //             setPoseHoldTimer(0);
// //         }
        
// //         canvasCtx.restore();
// //     }, [currentPose]);

// //     // Effect to handle the camera and pose detection lifecycle
// //     useEffect(() => {
// //         isMounted.current = true;
        
// //         if (!isActive) {
// //             if (streamRef.current) {
// //                 streamRef.current.getTracks().forEach(track => track.stop());
// //                 streamRef.current = null;
// //             }
// //             if (cameraRef.current) {
// //                 cameraRef.current.stop();
// //                 cameraRef.current = null;
// //             }
// //             if (poseRef.current) {
// //                 poseRef.current.close();
// //                 poseRef.current = null;
// //             }
// //             return () => { isMounted.current = false; };
// //         }

// //         const initialize = async () => {
// //             setIsInitializing(true);
// //             setCurrentPose(JOJO_POSES[Math.floor(Math.random() * JOJO_POSES.length)]);
// //             setTimeLeft(200);
// //             setPoseDetected(false);
// //             setPoseHoldTimer(0);
            
// //             try {
// //                 const videoElement = videoRef.current;
// //                 if (!videoElement) {
// //                     console.error('Video element not found. Aborting initialization.');
// //                     if (isMounted.current) setIsInitializing(false);
// //                     return;
// //                 }

// //                 const stream = await navigator.mediaDevices.getUserMedia({
// //                     video: { width: 640, height: 480 }
// //                 });

// //                 streamRef.current = stream;
// //                 videoElement.srcObject = stream;
                
// //                 await videoElement.play();

// //                 const pose = new Pose({
// //                     locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
// //                 });
                
// //                 pose.setOptions({
// //                     modelComplexity: 1,
// //                     smoothLandmarks: true,
// //                     enableSegmentation: false,
// //                     smoothSegmentation: false,
// //                     minDetectionConfidence: 0.5,
// //                     minTrackingConfidence: 0.5,
// //                 });
                
// //                 pose.onResults(onPoseResults);
// //                 poseRef.current = pose;

// //                 const camera = new MediaPipeCamera(videoElement, {
// //                     onFrame: async () => {
// //                         if (isMounted.current && poseRef.current && videoElement) {
// //                             await poseRef.current.send({ image: videoElement });
// //                         }
// //                     },
// //                     width: 640,
// //                     height: 480,
// //                 });
                
// //                 cameraRef.current = camera;
// //                 await camera.start();
                
// //                 if (isMounted.current) {
// //                     setCameraReady(true);
// //                     setIsInitializing(false);
// //                 }
// //             } catch (error) {
// //                 console.error('Failed to initialize pose detection:', error);
// //                 if (isMounted.current) {
// //                     setIsInitializing(false);
// //                 }
// //                 alert('Could not access the webcam. Please ensure you have granted permission.');
// //             }
// //         };

// //         initialize();

// //         return () => {
// //             isMounted.current = false;
// //             if (streamRef.current) {
// //                 streamRef.current.getTracks().forEach(track => track.stop());
// //                 streamRef.current = null;
// //             }
// //             if (cameraRef.current) {
// //                 cameraRef.current.stop();
// //                 cameraRef.current = null;
// //             }
// //             if (poseRef.current) {
// //                 poseRef.current.close();
// //                 poseRef.current = null;
// //             }
// //         };
// //     }, [isActive, onPoseResults]);

// //     // Effect to check if the pose has been held long enough.
// //     useEffect(() => {
// //         // We also check if the component is mounted to prevent errors.
// //         if (!isMounted.current) return;
// //         if (poseHoldTimer > POSE_HOLD_DURATION) {
// //             setPoseDetected(true);
// //         } else {
// //             setPoseDetected(false);
// //         }
// //     }, [poseHoldTimer]); // Removed onComplete dependency here to prevent infinite loops.

// //     // Timer logic for the countdown.
// //     useEffect(() => {
// //         if (!isActive || timeLeft <= 0 || poseDetected) return;
// //         const timer = setInterval(() => {
// //             setTimeLeft(prev => {
// //                 if (prev <= 1) {
// //                     onComplete(false);
// //                     return 0;
// //                 }
// //                 return prev - 1;
// //             });
// //         }, 1000);
// //         return () => clearInterval(timer);
// //     }, [isActive, timeLeft, onComplete, poseDetected]);

// //     // Trigger onComplete when pose is detected and held.
// //     useEffect(() => {
// //         if (poseDetected) {
// //             const successTimer = setTimeout(() => onComplete(true), 1000);
// //             return () => clearTimeout(successTimer);
// //         }
// //     }, [poseDetected, onComplete]);

// //     if (!isActive) return null;

// //     return (
// //         <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
// //             <Card className="w-full max-w-4xl mx-4 p-8 aura-effect dramatic-entrance">
// //                 <div className="text-center mb-6">
// //                     <div className="flex items-center justify-between mb-4">
// //                         <Badge variant="outline" className="text-lg px-4 py-2">
// //                             <Zap className="w-5 h-5 mr-2" />
// //                             JOJO CHALLENGE
// //                         </Badge>
// //                         <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={onClose}
// //                             className="hover:bg-destructive/20"
// //                         >
// //                             <X className="w-6 h-6" />
// //                         </Button>
// //                     </div>
// //                     <h1 className="text-4xl font-black text-menacing mb-2">
// //                         {currentPose?.name || "LOADING..."}
// //                     </h1>
// //                     <p className="text-xl text-muted-foreground mb-4">
// //                         {currentPose?.description || "Preparing challenge..."}
// //                     </p>
// //                     <div className="flex items-center justify-center gap-4 mb-6">
// //                         <div className={`text-6xl font-black ${timeLeft <= 5 ? 'text-destructive animate-countdown-pulse' : 'text-primary'}`}>
// //                             {timeLeft}
// //                         </div>
// //                         <div className="text-lg text-muted-foreground">seconds</div>
// //                     </div>
// //                 </div>
// //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //                     <div className="relative">
// //                         <div className="aspect-video bg-card rounded-lg overflow-hidden border-2 border-primary/30">
// //                             {isInitializing ? (
// //                                 <div className="flex items-center justify-center h-full">
// //                                     <div className="text-center">
// //                                         <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
// //                                         <p className="text-lg">Initializing camera...</p>
// //                                     </div>
// //                                 </div>
// //                             ) : (
// //                                 <div className="relative w-full h-full">
// //                                     <video
// //                                         ref={videoRef}
// //                                         className="absolute w-full h-full object-cover transform scaleX(-1)"
// //                                         autoPlay
// //                                         muted
// //                                         playsInline
// //                                     />
// //                                     <canvas
// //                                         ref={canvasRef}
// //                                         width={640}
// //                                         height={480}
// //                                         className="absolute w-full h-full"
// //                                     />
// //                                     {cameraReady && (
// //                                         <Badge
// //                                             variant={isPoseCorrect ? 'correct' : 'incorrect'}
// //                                             className="absolute top-4 right-4 text-sm px-3 py-2 flex items-center"
// //                                         >
// //                                             {isPoseCorrect ? (
// //                                                 <CircleCheck className="w-4 h-4 mr-1" />
// //                                             ) : (
// //                                                 <CircleX className="w-4 h-4 mr-1" />
// //                                             )}
// //                                             {isPoseCorrect ? 'Pose Match!' : 'No Match'}
// //                                         </Badge>
// //                                     )}
// //                                 </div>
// //                             )}
// //                         </div>
// //                         {poseDetected && (
// //                             <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg">
// //                                 <div className="text-center text-primary-foreground">
// //                                     <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
// //                                     <p className="text-2xl font-bold">POSE DETECTED!</p>
// //                                 </div>
// //                             </div>
// //                         )}
// //                     </div>
// //                     <div className="space-y-6">
// //                         <div className="bg-card/50 p-6 rounded-lg border border-primary/30">
// //                             <h3 className="text-xl font-bold mb-4 flex items-center">
// //                                 <AlertTriangle className="w-6 h-6 mr-2 text-accent" />
// //                                 INSTRUCTIONS
// //                             </h3>
// //                             <ul className="space-y-2 text-muted-foreground">
// //                                 <li>• Position yourself in front of the camera</li>
// //                                 <li>• Strike the {currentPose?.name} pose</li>
// //                                 <li>• Hold the pose until detected</li>
// //                                 <li>• You have {timeLeft} seconds remaining</li>
// //                             </ul>
// //                         </div>
// //                         <div className="bg-accent/10 p-6 rounded-lg border border-accent/30">
// //                             <h3 className="text-lg font-bold mb-2 text-accent">WARNING</h3>
// //                             <p className="text-sm text-muted-foreground">
// //                                 This is a demo version. In the original concept, failure to complete 
// //                                 the challenge would trigger system actions. This version is safe for testing.
// //                             </p>
// //                         </div>
// //                         <div className="flex gap-4">
// //                             <Button variant="dramatic" size="challenge" onClick={() => onComplete(false)} className="flex-1">
// //                                 GIVE UP
// //                             </Button>
// //                             <Button variant="menacing" size="challenge" onClick={() => onComplete(true)} className="flex-1">
// //                                 FORCE SUCCESS
// //                             </Button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </Card>
// //         </div>
// //     );
// // };

// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Camera, Zap, AlertTriangle, CheckCircle, X, CircleCheck, CircleX } from 'lucide-react';
// import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
// import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// // Helper function to calculate the angle between three points.
// const calculateAngle = (A: any, B: any, C: any): number => {
//     if (!A || !B || !C) return 0;
//     const a = { x: A.x - B.x, y: A.y - B.y };
//     // FIX: The y-component of vector b was incorrectly using B.x. It should be B.y.
//     const b = { x: C.x - B.x, y: C.y - B.y };
//     const dot = a.x * b.x + a.y * b.y;
//     const magA = Math.sqrt(a.x * a.x + a.y * a.y);
//     const magB = Math.sqrt(b.x * b.x + b.y * b.y);

//     if (magA === 0 || magB === 0) return 0;

//     const angle = Math.acos(dot / (magA * magB)) * (180 / Math.PI);
//     return angle;
// };

// // Interface for a specific pose, now including a hold duration.
// interface PoseReference {
//     name: string;
//     description: string;
//     keyPoints: {
//         leftElbow: number;
//         rightElbow: number;
//         leftShoulder: number;
//         rightShoulder: number;
//     };
// }

// const JOJO_POSES: PoseReference[] = [
//     {
//         name: "MENACING STANCE",
//         description: "Raise both arms with elbows bent at 90 degrees",
//         keyPoints: { leftElbow: 90, rightElbow: 90, leftShoulder: 45, rightShoulder: 45 }
//     },
//     {
//         name: "BIZARRE ADVENTURE",
//         description: "Point dramatically with one arm extended",
//         keyPoints: { leftElbow: 160, rightElbow: 30, leftShoulder: 0, rightShoulder: 90 }
//     },
//     {
//         name: "STAND POWER",
//         description: "Cross arms in front of chest",
//         keyPoints: { leftElbow: 45, rightElbow: 45, leftShoulder: -30, rightShoulder: 30 }
//     }
// ];

// interface PoseChallengeProps {
//     isActive: boolean;
//     onComplete: (success: boolean) => void;
//     onClose: () => void;
// }

// export const PoseChallenge: React.FC<PoseChallengeProps> = ({
//     isActive,
//     onComplete,
//     onClose
// }) => {
//     const [timeLeft, setTimeLeft] = useState(200);
//     const [currentPose, setCurrentPose] = useState<PoseReference>();
//     const [poseDetected, setPoseDetected] = useState(false);
//     const [isInitializing, setIsInitializing] = useState(true);
//     const [cameraReady, setCameraReady] = useState(false);
//     const [isPoseCorrect, setIsPoseCorrect] = useState(false); // New state for indicator

//     // State to track the hold timer to prevent flickering.
//     const [poseHoldTimer, setPoseHoldTimer] = useState(0);
//     const POSE_HOLD_DURATION = 30; // Number of frames to hold the pose.

//     const videoRef = useRef<HTMLVideoElement>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const poseRef = useRef<Pose | null>(null);
//     const cameraRef = useRef<MediaPipeCamera | null>(null);
//     const streamRef = useRef<MediaStream | null>(null);
//     const isMounted = useRef(false);

//     const checkPoseMatch = (landmarks: any[], targetPose: PoseReference): boolean => {
//         // Check if key landmarks are present before calculating angles.
//         if (!landmarks[11] || !landmarks[12] || !landmarks[13] || !landmarks[14]) {
//             return false;
//         }

//         // Calculate angles of the left elbow, right elbow, and shoulders.
//         // FIX: Replaced incorrect landmark mappings for more accurate angles.
//         const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
//         const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
//         const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
//         const rightShoulderAngle = calculateAngle(landmarks[14], landmarks[12], landmarks[24]);

//         const angleTolerance = 25; // Tolerance in degrees for matching angles.

//         const leftElbowMatch = Math.abs(leftElbowAngle - targetPose.keyPoints.leftElbow) < angleTolerance;
//         const rightElbowMatch = Math.abs(rightElbowAngle - targetPose.keyPoints.rightElbow) < angleTolerance;
//         const leftShoulderMatch = Math.abs(leftShoulderAngle - targetPose.keyPoints.leftShoulder) < angleTolerance;
//         const rightShoulderMatch = Math.abs(rightShoulderAngle - targetPose.keyPoints.rightShoulder) < angleTolerance;

//         // A pose is considered a match if all key angles are within the tolerance.
//         return leftElbowMatch && rightElbowMatch && leftShoulderMatch && rightShoulderMatch;
//     };

//     const onPoseResults = useCallback((results: any) => {
//         const canvasElement = canvasRef.current;
//         const videoElement = videoRef.current;
//         if (!canvasElement || !videoElement || !currentPose || !isMounted.current) return;

//         const canvasCtx = canvasElement.getContext('2d');
//         if (!canvasCtx) return;

//         canvasCtx.save();
//         canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//         canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

//         let poseMatch = false;
//         if (results.poseLandmarks) {
//             poseMatch = checkPoseMatch(results.poseLandmarks, currentPose);
//             setIsPoseCorrect(poseMatch); // Update new state for the indicator

//             const lineColor = poseMatch ? '#00FF00' : '#FF0000';
//             drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: lineColor, lineWidth: 2 });
//             drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#00FF00', lineWidth: 1 });

//             if (poseMatch) {
//                 setPoseHoldTimer(prev => prev + 1);
//             } else {
//                 setPoseHoldTimer(0);
//             }
//         } else {
//             setIsPoseCorrect(false); // No landmarks, so no pose match
//             setPoseHoldTimer(0);
//         }
        
//         canvasCtx.restore();
//     }, [currentPose]);

//     // Effect to handle the camera and pose detection lifecycle
//     useEffect(() => {
//         isMounted.current = true;
        
//         if (!isActive) {
//             if (streamRef.current) {
//                 streamRef.current.getTracks().forEach(track => track.stop());
//                 streamRef.current = null;
//             }
//             if (cameraRef.current) {
//                 cameraRef.current.stop();
//                 cameraRef.current = null;
//             }
//             if (poseRef.current) {
//                 poseRef.current.close();
//                 poseRef.current = null;
//             }
//             return () => { isMounted.current = false; };
//         }

//         const initialize = async () => {
//             setIsInitializing(true);
//             setCurrentPose(JOJO_POSES[Math.floor(Math.random() * JOJO_POSES.length)]);
//             setTimeLeft(200);
//             setPoseDetected(false);
//             setPoseHoldTimer(0);
            
//             try {
//                 const videoElement = videoRef.current;
//                 if (!videoElement) {
//                     console.error('Video element not found. Aborting initialization.');
//                     if (isMounted.current) setIsInitializing(false);
//                     return;
//                 }

//                 const stream = await navigator.mediaDevices.getUserMedia({
//                     video: { width: 640, height: 480 }
//                 });

//                 streamRef.current = stream;
//                 videoElement.srcObject = stream;
                
//                 await videoElement.play();

//                 const pose = new Pose({
//                     locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//                 });
                
//                 pose.setOptions({
//                     modelComplexity: 1,
//                     smoothLandmarks: true,
//                     enableSegmentation: false,
//                     smoothSegmentation: false,
//                     minDetectionConfidence: 0.5,
//                     minTrackingConfidence: 0.5,
//                 });
                
//                 pose.onResults(onPoseResults);
//                 poseRef.current = pose;

//                 const camera = new MediaPipeCamera(videoElement, {
//                     onFrame: async () => {
//                         if (isMounted.current && poseRef.current && videoElement) {
//                             await poseRef.current.send({ image: videoElement });
//                         }
//                     },
//                     width: 640,
//                     height: 480,
//                 });
                
//                 cameraRef.current = camera;
//                 await camera.start();
                
//                 if (isMounted.current) {
//                     setCameraReady(true);
//                     setIsInitializing(false);
//                 }
//             } catch (error) {
//                 console.error('Failed to initialize pose detection:', error);
//                 if (isMounted.current) {
//                     setIsInitializing(false);
//                 }
//                 alert('Could not access the webcam. Please ensure you have granted permission.');
//             }
//         };

//         initialize();

//         return () => {
//             isMounted.current = false;
//             if (streamRef.current) {
//                 streamRef.current.getTracks().forEach(track => track.stop());
//                 streamRef.current = null;
//             }
//             if (cameraRef.current) {
//                 cameraRef.current.stop();
//                 cameraRef.current = null;
//             }
//             if (poseRef.current) {
//                 poseRef.current.close();
//                 poseRef.current = null;
//             }
//         };
//     }, [isActive, onPoseResults]);

//     // Effect to check if the pose has been held long enough.
//     useEffect(() => {
//         // We also check if the component is mounted to prevent errors.
//         if (!isMounted.current) return;
//         if (poseHoldTimer > POSE_HOLD_DURATION) {
//             setPoseDetected(true);
//         } else {
//             setPoseDetected(false);
//         }
//     }, [poseHoldTimer]); // Removed onComplete dependency here to prevent infinite loops.

//     // Timer logic for the countdown.
//     useEffect(() => {
//         if (!isActive || timeLeft <= 0 || poseDetected) return;
//         const timer = setInterval(() => {
//             setTimeLeft(prev => {
//                 if (prev <= 1) {
//                     onComplete(false);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);
//         return () => clearInterval(timer);
//     }, [isActive, timeLeft, onComplete, poseDetected]);

//     // Trigger onComplete when pose is detected and held.
//     useEffect(() => {
//         if (poseDetected) {
//             const successTimer = setTimeout(() => onComplete(true), 1000);
//             return () => clearTimeout(successTimer);
//         }
//     }, [poseDetected, onComplete]);

//     if (!isActive) return null;

//     return (
//         <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
//             <Card className="w-full max-w-4xl mx-4 p-8 aura-effect dramatic-entrance">
//                 <div className="text-center mb-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <Badge variant="outline" className="text-lg px-4 py-2">
//                             <Zap className="w-5 h-5 mr-2" />
//                             JOJO CHALLENGE
//                         </Badge>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={onClose}
//                             className="hover:bg-destructive/20"
//                         >
//                             <X className="w-6 h-6" />
//                         </Button>
//                     </div>
//                     <h1 className="text-4xl font-black text-menacing mb-2">
//                         {currentPose?.name || "LOADING..."}
//                     </h1>
//                     <p className="text-xl text-muted-foreground mb-4">
//                         {currentPose?.description || "Preparing challenge..."}
//                     </p>
//                     <div className="flex items-center justify-center gap-4 mb-6">
//                         <div className={`text-6xl font-black ${timeLeft <= 5 ? 'text-destructive animate-countdown-pulse' : 'text-primary'}`}>
//                             {timeLeft}
//                         </div>
//                         <div className="text-lg text-muted-foreground">seconds</div>
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div className="relative">
//                         <div className="aspect-video bg-card rounded-lg overflow-hidden border-2 border-primary/30">
//                             {isInitializing ? (
//                                 <div className="flex items-center justify-center h-full">
//                                     <div className="text-center">
//                                         <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
//                                         <p className="text-lg">Initializing camera...</p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="relative w-full h-full">
//                                     <video
//                                         ref={videoRef}
//                                         className="absolute w-full h-full object-cover transform scaleX(-1)"
//                                         autoPlay
//                                         muted
//                                         playsInline
//                                     />
//                                     <canvas
//                                         ref={canvasRef}
//                                         width={640}
//                                         height={480}
//                                         className="absolute w-full h-full"
//                                     />
//                                     {cameraReady && (
//                                         <Badge
//                                             variant={isPoseCorrect ? 'correct' : 'incorrect'}
//                                             className="absolute top-4 right-4 text-sm px-3 py-2 flex items-center"
//                                         >
//                                             {isPoseCorrect ? (
//                                                 <CircleCheck className="w-4 h-4 mr-1" />
//                                             ) : (
//                                                 <CircleX className="w-4 h-4 mr-1" />
//                                             )}
//                                             {isPoseCorrect ? 'Pose Match!' : 'No Match'}
//                                         </Badge>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                         {poseDetected && (
//                             <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg">
//                                 <div className="text-center text-primary-foreground">
//                                     <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
//                                     <p className="text-2xl font-bold">POSE DETECTED!</p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                     <div className="space-y-6">
//                         <div className="bg-card/50 p-6 rounded-lg border border-primary/30">
//                             <h3 className="text-xl font-bold mb-4 flex items-center">
//                                 <AlertTriangle className="w-6 h-6 mr-2 text-accent" />
//                                 INSTRUCTIONS
//                             </h3>
//                             <ul className="space-y-2 text-muted-foreground">
//                                 <li>• Position yourself in front of the camera</li>
//                                 <li>• Strike the {currentPose?.name} pose</li>
//                                 <li>• Hold the pose until detected</li>
//                                 <li>• You have {timeLeft} seconds remaining</li>
//                             </ul>
//                         </div>
//                         <div className="bg-accent/10 p-6 rounded-lg border border-accent/30">
//                             <h3 className="text-lg font-bold mb-2 text-accent">WARNING</h3>
//                             <p className="text-sm text-muted-foreground">
//                                 This is a demo version. In the original concept, failure to complete 
//                                 the challenge would trigger system actions. This version is safe for testing.
//                             </p>
//                         </div>
//                         <div className="flex gap-4">
//                             <Button variant="dramatic" size="challenge" onClick={() => onComplete(false)} className="flex-1">
//                                 GIVE UP
//                             </Button>
//                             <Button variant="menacing" size="challenge" onClick={() => onComplete(true)} className="flex-1">
//                                 FORCE SUCCESS
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </Card>
//         </div>
//     );
// };

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Zap,
  AlertTriangle,
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
  const [timeLeft, setTimeLeft] = useState(200);
  const [currentPose, setCurrentPose] = useState<PoseReference>();
  const [poseDetected, setPoseDetected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [poseHoldTimer, setPoseHoldTimer] = useState(0);
  const POSE_HOLD_DURATION = 30;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMounted = useRef(false);

  const checkPoseMatch = (landmarks: any[], targetPose: PoseReference): boolean => {
    if (!landmarks[11] || !landmarks[12] || !landmarks[13] || !landmarks[14]) return false;
    const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
    const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
    const rightShoulderAngle = calculateAngle(landmarks[14], landmarks[12], landmarks[24]);

    const angleTolerance = 25;

    return (
      Math.abs(leftElbowAngle - targetPose.keyPoints.leftElbow) < angleTolerance &&
      Math.abs(rightElbowAngle - targetPose.keyPoints.rightElbow) < angleTolerance &&
      Math.abs(leftShoulderAngle - targetPose.keyPoints.leftShoulder) < angleTolerance &&
      Math.abs(rightShoulderAngle - targetPose.keyPoints.rightShoulder) < angleTolerance
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
      setTimeLeft(200);
      setPoseDetected(false);
      setPoseHoldTimer(0);

      try {
        const video = videoRef.current;
        if (!video) return;

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
        setCameraReady(true);
      } catch (err) {
        console.error('Camera error:', err);
        alert('Could not access camera. Please allow webcam permissions.');
      } finally {
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
    if (!isMounted.current) return;
    setPoseDetected(poseHoldTimer > POSE_HOLD_DURATION);
  }, [poseHoldTimer]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0 || poseDetected) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete, poseDetected]);

  useEffect(() => {
    if (poseDetected) {
      const timeout = setTimeout(() => onComplete(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, [poseDetected, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
      <Card className="max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <Badge>
            <Zap className="w-4 h-4 mr-1" /> JOJO CHALLENGE
          </Badge>
          <Button variant="ghost" onClick={onClose}>
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
                  // variant={isPoseCorrect ? 'correct' : 'destructive'}
                  variant={isPoseCorrect ? 'default' : 'destructive'}

                >
                  {isPoseCorrect ? <CircleCheck className="mr-1" /> : <CircleX className="mr-1" />}
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
            <div className="flex gap-4">
              <Button onClick={() => onComplete(false)} className="flex-1">
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
  );
};
