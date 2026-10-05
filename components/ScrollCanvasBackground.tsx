"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollCanvasBackgroundProps {
  progress: number; // 0 to 1
  totalFrames?: number;
}

export default function ScrollCanvasBackground({
  progress,
  totalFrames = 150,
}: ScrollCanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const isLoadedRef = useRef<boolean[]>([]);
  const targetFrameRef = useRef<number>(1);
  const currentFrameRef = useRef<number>(1);
  const renderedFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState<boolean>(false);

  // Sync target frame when progress prop changes
  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    targetFrameRef.current = 1 + clampedProgress * (totalFrames - 1);
  }, [progress, totalFrames]);

  // Preload all 150 WebP frames progressively
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const isLoaded: boolean[] = new Array(totalFrames + 1).fill(false);

    const getFrameUrl = (index: number) => {
      const padded = String(index).padStart(3, "0");
      return `/frames-webp/ezgif-frame-${padded}.webp`;
    };

    // 1. Load Frame 1 immediately
    const firstImg = new window.Image();
    firstImg.src = getFrameUrl(1);
    firstImg.onload = () => {
      images[1] = firstImg;
      isLoaded[1] = true;
      setIsFirstFrameLoaded(true);
      requestAnimationFrame(() => {
        drawFrameToCanvas(firstImg);
      });
    };
    images[1] = firstImg;

    // 2. Preload remaining frames
    for (let i = 2; i <= totalFrames; i++) {
      const img = new window.Image();
      img.src = getFrameUrl(i);
      const frameIdx = i;
      img.onload = () => {
        images[frameIdx] = img;
        isLoaded[frameIdx] = true;

        const currentTarget = Math.round(currentFrameRef.current);
        if (currentTarget === frameIdx) {
          drawFrameToCanvas(img);
        }
      };
      images[frameIdx] = img;
    }

    imagesRef.current = images;
    isLoadedRef.current = isLoaded;

    return () => {
      images.length = 0;
    };
  }, [totalFrames]);

  // Draw frame with object-fit: cover and crisp retina DPR scaling
  const drawFrameToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const imgRatio = imgW / imgH;
    const canvasRatio = cw / ch;

    let renderW: number;
    let renderH: number;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderW = cw;
      renderH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  // Safe frame retrieval with nearest-neighbor fallback
  const getRenderableImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const isLoaded = isLoadedRef.current;

    if (images[targetIndex] && isLoaded[targetIndex] && images[targetIndex].complete) {
      return images[targetIndex];
    }

    for (let offset = 1; offset < totalFrames; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 1 && images[prev] && isLoaded[prev] && images[prev].complete) {
        return images[prev];
      }
      const next = targetIndex + offset;
      if (next <= totalFrames && images[next] && isLoaded[next] && images[next].complete) {
        return images[next];
      }
    }

    return images[1] || null;
  };

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const img = getRenderableImage(Math.round(currentFrameRef.current));
      if (img) {
        drawFrameToCanvas(img);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isFirstFrameLoaded]);

  // Persistent RAF Lerp Loop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;

      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
      } else if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * 0.12; // buttery smooth easing
      }

      const frameIndex = Math.min(
        totalFrames,
        Math.max(1, Math.round(currentFrameRef.current))
      );

      if (frameIndex !== renderedFrameRef.current) {
        const img = getRenderableImage(frameIndex);
        if (img) {
          drawFrameToCanvas(img);
          renderedFrameRef.current = frameIndex;
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [totalFrames]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* Pinned 100% sharp Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover will-change-transform"
      />

      {/* Atmospheric Cinematic Left Gradient:
          Strongest opacity around 10-25% of the frame, gradually reducing toward 45-50%.
          Blends organically with no hard edges or rectangular feel. */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 95% 85% at 5% 45%, rgba(5, 4, 8, 0.62) 0%, rgba(5, 4, 8, 0.48) 22%, rgba(5, 4, 8, 0.22) 38%, rgba(5, 4, 8, 0.04) 48%, transparent 54%),
            linear-gradient(90deg, 
              rgba(5, 4, 8, 0.76) 0%, 
              rgba(5, 4, 8, 0.75) 15%, 
              rgba(5, 4, 8, 0.70) 24%, 
              rgba(5, 4, 8, 0.52) 32%, 
              rgba(5, 4, 8, 0.32) 39%, 
              rgba(5, 4, 8, 0.14) 45%, 
              rgba(5, 4, 8, 0.03) 49%, 
              transparent 53%
            )
          `,
        }}
      />
    </div>
  );
}
