import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanViewProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualTrigger, setShowManualTrigger] = useState(false);
  const [devicesList, setDevicesList] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const startScannerWithId = async (cameraId: string) => {
    setErrorMessage(null);
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }

    const html5QrCode = scannerRef.current || new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      const config = { 
        fps: 25, 
        qrbox: (viewWidth: number, viewHeight: number) => {
          // Provide a perfect unzoomed scanning box proportional to screen
          const size = Math.min(viewWidth, viewHeight) * 0.70;
          return { width: size, height: size };
        },
        // Request typical resolution constraints to prevent default macro telephoto lens selection
        videoConstraints: {
          deviceId: cameraId,
          aspectRatio: { ideal: 1.333333 }, // 4:3 is standard for barcode sensors to reduce fake zoom
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop().catch(console.error);
        },
        () => {}
      );
      
      setIsReady(true);
      setShowManualTrigger(false);
      setActiveCameraId(cameraId);

      // Force video element to use 'contain' mode so it never stretches or zooms
      setTimeout(() => {
        const videoEl = document.querySelector('#reader video') as HTMLVideoElement;
        if (videoEl) {
          videoEl.style.setProperty('object-fit', 'contain', 'important');
          videoEl.style.setProperty('width', '100%', 'important');
          videoEl.style.setProperty('height', '100%', 'important');
        }
      }, 350);

    } catch (err: any) {
      console.error("Error starting camera by ID:", err);
      setErrorMessage("Could not launch selected lens. Try choosing another camera.");
    }
  };

  const startScannerGeneral = async (mode: "user" | "environment") => {
    setErrorMessage(null);
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    
    const html5QrCode = scannerRef.current || new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      const config = { 
        fps: 25, 
        qrbox: (viewWidth: number, viewHeight: number) => {
          const size = Math.min(viewWidth, viewHeight) * 0.70;
          return { width: size, height: size };
        }
      };
      
      await html5QrCode.start(
        { facingMode: mode },
        config,
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop().catch(console.error);
        },
        () => {}
      );
      setIsReady(true);
      setShowManualTrigger(false);

      // Fix zoom ratio styling
      setTimeout(() => {
        const videoEl = document.querySelector('#reader video') as HTMLVideoElement;
        if (videoEl) {
          videoEl.style.setProperty('object-fit', 'contain', 'important');
          videoEl.style.setProperty('width', '100%', 'important');
          videoEl.style.setProperty('height', '100%', 'important');
        }
      }, 350);

    } catch (err: any) {
      console.error("Error starting general scanner:", err);
      if (mode === "environment") {
        startScannerGeneral("user");
      } else {
        setErrorMessage(
          "Camera access is not permitted. Please grant Obsidian Ledger permission to use the camera in your Android device's app settings."
        );
      }
    }
  };

  useEffect(() => {
    // Bulletproof Back Camera Preference check:
    // We inspect all video inputs and search for keywords like 'rear', 'back', 'environment', or second/third camera device listings
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setDevicesList(devices);
          
          // Locate back lens
          const backLens = devices.find(d => {
            const label = d.label.toLowerCase();
            return label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('facing 1');
          });

          if (backLens) {
            console.log("Bulletproof back camera detected and prioritized:", backLens.label);
            startScannerWithId(backLens.id);
          } else {
            // Fallback to first available device or facingMode environment
            startScannerWithId(devices[0].id);
          }
        } else {
          // Fallback to default facingMode selection
          startScannerGeneral("environment");
        }
      })
      .catch(err => {
        console.warn("Could not retrieve camera devices list on startup:", err);
        startScannerGeneral("environment");
      });

    const timer = setTimeout(() => {
      setShowManualTrigger(true);
    }, 1800);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const switchCamera = () => {
    if (devicesList.length <= 1) return;
    
    const currentIndex = devicesList.findIndex(d => d.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % devicesList.length;
    const nextDevice = devicesList[nextIndex];
    
    if (nextDevice) {
      startScannerWithId(nextDevice.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Target Video Wrapper */}
      <div id="reader" className="absolute inset-0 w-full h-full bg-black flex items-center justify-center" />

      {/* Header Panel */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/95 via-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
            <Zap size={20} className="text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-headline text-lg font-bold">Scan & Pay</h2>
            <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">UPI Global Secure Node</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {devicesList.length > 1 && (
            <button 
              onClick={switchCamera}
              className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
            >
              <RefreshCw size={20} />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Target HUD Frame */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Transparent layout shadow overlay mask to focus on centered box */}
        <div className="absolute inset-0 bg-black/60" style={{ 
          clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, calc(50% - 130px) calc(50% - 130px), calc(50% + 130px) calc(50% - 130px), calc(50% + 130px) calc(50% + 130px), calc(50% - 130px) calc(50% + 130px), calc(50% - 130px) calc(50% - 130px))' 
        }} />

        {/* Framing brackets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[260px] h-[260px] relative">
            <motion.div 
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            </motion.div>

            {/* Glowing sweep laser */}
            <motion.div 
              animate={{ 
                top: ['3%', '97%', '3%'],
                opacity: [0.3, 0.9, 0.3]
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-4 right-4 h-[3px] bg-primary shadow-[0_0_20px_rgba(186,158,255,0.8)] z-50 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Manual retry or activation prompt if needed */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black p-6">
          <div className="flex flex-col items-center gap-6 max-w-xs text-center">
            {errorMessage ? (
              <>
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-1 border border-error/25">
                  <X size={28} className="text-error" />
                </div>
                <div>
                  <p className="text-white font-headline text-lg font-bold">Camera Initialization Delayed</p>
                  <p className="text-white/60 text-xs mt-2 leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    if (activeCameraId) startScannerWithId(activeCameraId);
                  }}
                  className="w-full bg-primary text-surface font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-transform cursor-pointer shadow-lg shadow-primary/20"
                >
                  Reload Lens Node
                </button>
              </>
            ) : showManualTrigger ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mb-1 border border-primary/20">
                  <Zap size={28} className="text-primary animate-bounce" />
                </div>
                <div>
                  <p className="text-white font-headline text-lg font-bold">Interactive Camera Check</p>
                  <p className="text-white/60 text-xs mt-2 leading-relaxed">
                    Verify camera permissions to authenticate QR and link digital wallets.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowManualTrigger(false);
                    startScannerGeneral("environment");
                  }}
                  className="w-full bg-primary text-surface font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-transform"
                >
                  Activate Video capture
                </button>
              </>
            ) : (
              <>
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                  <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-headline text-lg font-bold">Spinning up Camera feed</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Establishing link...</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer message */}
      <div className="absolute bottom-0 left-0 right-0 p-12 text-center z-50 bg-gradient-to-t from-black/95 to-transparent">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl py-3 px-6 inline-block">
          <p className="text-white/95 text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-primary animate-pulse" />
            Point camera at UPI QR payment codes
          </p>
        </div>
      </div>
    </div>
  );
};
