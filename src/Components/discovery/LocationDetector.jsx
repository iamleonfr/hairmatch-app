import React, { useState } from "react";
import supabaseApi from "../../api/supabaseAdapter";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export default function LocationDetector({ onLocationDetected, currentLocation }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await supabaseApi.auth.updateMe({
            latitude,
            longitude
          });

          const cityResponse = await supabaseApi.integrations.Core.InvokeLLM({
            prompt: `Given these GPS coordinates: latitude ${latitude}, longitude ${longitude}, 
            what is the city name? Respond with just the city name, nothing else.`,
            response_json_schema: {
              type: "object",
              properties: {
                city: { type: "string" }
              }
            }
          });

            if (cityResponse.city) {
            await supabaseApi.auth.updateMe({
              location_city: cityResponse.city
            });
          }

          onLocationDetected?.({ latitude, longitude, city: cityResponse.city });
        } catch (err) {
          setError("Failed to save location. Please try again.");
        }

        setIsDetecting(false);
      },
      (err) => {
        setError("Could not get your location. Please check permissions.");
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-semibold">
          <MapPin className="w-5 h-5" />
          Your Location
        </div>

        {currentLocation?.latitude ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Location Set</span>
            </div>
            <p className="text-sm text-green-700">
              {currentLocation.city || 'Location detected'}
            </p>
          </div>
        ) : null}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={detectLocation}
          disabled={isDetecting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Detecting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              {currentLocation?.latitude ? 'Update Location' : 'Use My Location'}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          We'll use your location to find nearby barbers
        </p>
      </CardContent>
    </Card>
  );
}