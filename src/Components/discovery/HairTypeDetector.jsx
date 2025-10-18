import React, { useState, useRef } from "react";
import supabaseApi from "../../api/supabaseAdapter";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Camera, Upload, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

const HAIR_TYPE_INFO = {
  "1A": "Straight, fine hair - very soft and shiny",
  "1B": "Straight, medium texture",
  "1C": "Straight, coarse hair",
  "2A": "Wavy, fine hair with slight S-pattern",
  "2B": "Wavy, medium texture with defined S-pattern",
  "2C": "Wavy, coarse hair with strong S-pattern",
  "3A": "Curly, loose curls with bounce",
  "3B": "Curly, tight curls with volume",
  "3C": "Curly, tight corkscrews",
  "4A": "Coily, tight S-pattern coils",
  "4B": "Coily, Z-pattern coils",
  "4C": "Coily, very tight Z-pattern"
};

export default function HairTypeDetector({ onDetectionComplete, currentHairType }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedType, setDetectedType] = useState(currentHairType);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const detectHairType = async (file) => {
    setIsDetecting(true);
    setError(null);

    try {
  const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });

  const result = await supabaseApi.integrations.Core.InvokeLLM({
        prompt: `Analyze this photo and determine the person's hair type according to the Andre Walker Hair Typing System (1A-4C scale).
        
Hair Type Classification:
Type 1 (Straight): 1A (fine), 1B (medium), 1C (coarse)
Type 2 (Wavy): 2A (fine S-waves), 2B (medium S-waves), 2C (coarse S-waves)
Type 3 (Curly): 3A (loose curls), 3B (tight curls), 3C (tight corkscrews)
Type 4 (Coily): 4A (tight coils), 4B (Z-pattern), 4C (very tight Z-pattern)

Respond with just the hair type code (e.g., "3B" or "4A"). If unclear from the image, respond with "Not Detected".`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            hair_type: {
              type: "string",
              enum: ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "4A", "4B", "4C", "Not Detected"]
            },
            confidence: {
              type: "string"
            }
          }
        }
      });

          if (result.hair_type && result.hair_type !== "Not Detected") {
            setDetectedType(result.hair_type);
            await supabaseApi.auth.updateMe({
              hair_type: result.hair_type,
              hair_type_photo: file_url
            });
        onDetectionComplete?.(result.hair_type);
      } else {
        setError("Could not detect hair type clearly. Please try another photo with better lighting.");
      }
    } catch (err) {
      setError("Failed to analyze photo. Please try again.");
    }

    setIsDetecting(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      detectHairType(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `hair-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      detectHairType(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  return (
    <Card className="border-2 border-orange-200 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Sparkles className="w-6 h-6" />
          AI Hair Type Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {detectedType && detectedType !== "Not Set" ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Your Hair Type: {detectedType}</span>
            </div>
            <p className="text-sm text-green-700">{HAIR_TYPE_INFO[detectedType]}</p>
          </div>
        ) : null}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showCamera ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDetecting}
            >
              <Upload className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Upload Photo</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
              onClick={startCamera}
              disabled={isDetecting}
            >
              <Camera className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Take Photo</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={capturePhoto} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isDetecting && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
            <span className="text-sm text-gray-600">Analyzing your hair type...</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="text-xs text-gray-500 text-center mt-4">
          Upload a clear photo of your hair for best results
        </div>
      </CardContent>
    </Card>
  );
}