"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { BinInfo, UserTrashInfo, get_bin_plan_callable, get_identify_trash_callable } from "./firebase";
import Cookies from 'js-cookie';

const CameraView = ({ onCapture, disabled }: { onCapture: (base64: string) => void, disabled: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access camera:", err);
      }
    }
    setupCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || disabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');
    onCapture(base64);
  }, [onCapture, disabled]);

  return (
    <div className="relative h-screen w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={captureImage}
        disabled={disabled}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-blue-500 disabled:opacity-50"
        aria-label="Take Photo"
      />
    </div>
  );
};

export default function Home() {
  const [mode, setMode] = useState<"setup" | "identify">("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Setup form state
  const [numBins, setNumBins] = useState(4);
  const [region, setRegion] = useState("");
  const [comments, setComments] = useState("");
  
  // Results state
  const [bins, setBins] = useState<BinInfo[]>(() => {
    const saved = Cookies.get('binConfiguration');
    return saved ? JSON.parse(saved) : [];
  });
  const [identificationResult, setIdentificationResult] = useState<{title: string, more_info: string} | null>(null);

  useEffect(() => {
    if (bins.length > 0) {
      Cookies.set('binConfiguration', JSON.stringify(bins), { expires: 30 }); // Expires in 30 days
    }
  }, [bins]);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const binPlan = get_bin_plan_callable();
      const result = await binPlan({
        num_trash_bins: numBins,
        region,
        comments
      });
      setBins(result.data);
      setMode("identify");
    } catch (err) {
      setError("Failed to generate bin plan. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = useCallback(async (base64: string) => {
    setLoading(true);
    setError(null);
    setIdentificationResult(null);

    try {
      const identifyTrash = get_identify_trash_callable();
      const result = await identifyTrash({
        bins_info: bins,
        base64_image: base64
      });
      setIdentificationResult(result.data);
      
      // Clear the result after 15 seconds
      setTimeout(() => {
        setIdentificationResult(null);
      }, 15000);
    } catch (err) {
      setError("Failed to identify trash. Please try again.");
      console.error(err);
    }
    setLoading(false);
  }, [bins]);

  if (mode === "identify" && bins.length > 0) {
    return (
      <div className="relative h-screen w-screen bg-black">
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value as "setup" | "identify")}
          className="absolute top-4 right-4 z-10 bg-white rounded-md border px-3 py-2 text-black"
        >
          <option value="setup">Setup</option>
          <option value="identify">Camera</option>
        </select>

        <CameraView onCapture={handleCapture} disabled={loading} />
        
        <div className="absolute bottom-28 left-4 right-4 bg-white rounded-lg p-4 mx-4">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-black">Analyzing image...</span>
            </div>
          ) : identificationResult ? (
            <>
              <h3 className="font-bold text-lg text-black">{identificationResult.title}</h3>
              {identificationResult.more_info && (
                <p className="mt-2">{identificationResult.more_info}</p>
              )}
            </>
          ) : (
              <p className="text-black text-center">
              Hold your trash up in front of the camera and click the button to have your trash sorted.
            </p>
          )}
        </div>
        
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-lg p-4 transition-opacity ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>        {error && (
          <div className="absolute top-16 left-4 right-4 bg-red-50 text-red-600 rounded-lg p-4 mx-4">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Smart Trash Sorter</h1>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value as "setup" | "identify")}
          className="bg-white text-black rounded-md border px-3 py-2"
        >
          <option value="setup">Setup</option>
          <option value="identify">Camera</option>
        </select>
      </div>

      {bins.length === 0 ? (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Bins
              <input
                type="number"
                min={1}
                max={10}
                value={numBins}
                onChange={(e) => setNumBins(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Region (City, State)
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Rochester, NY"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Comments
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="One of my bins is extra large. These bins will be in a food court."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Generating Plan..." : "Generate Bin Plan"}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bins.map((bin, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg">{bin.title}</h3>
                <p className="text-sm mt-2">{bin.description}</p>
                <p className="text-sm mt-2 text-gray-600">Quantity: {bin.count}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setMode("setup");
              setBins([]);
              setIdentificationResult(null);
              Cookies.remove('binConfiguration');
            }}
            className="mt-4 text-blue-500 hover:underline"
          >
            Reset Configuration
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </main>
  );
}
