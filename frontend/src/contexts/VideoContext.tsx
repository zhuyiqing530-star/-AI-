"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type GenerateStep = "upload" | "configure" | "generating" | "preview";

interface VideoState {
  step: GenerateStep;
  files: File[];
  productUrl: string;
  languages: string[];
  style: string;
  setStep: (s: GenerateStep) => void;
  setFiles: (f: File[]) => void;
  setProductUrl: (u: string) => void;
  setLanguages: (l: string[]) => void;
  setStyle: (s: string) => void;
  reset: () => void;
}

const VideoContext = createContext<VideoState | null>(null);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<GenerateStep>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [productUrl, setProductUrl] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [style, setStyle] = useState("default");

  const reset = () => {
    setStep("upload");
    setFiles([]);
    setProductUrl("");
    setLanguages([]);
    setStyle("default");
  };

  return (
    <VideoContext.Provider value={{
      step, files, productUrl, languages, style,
      setStep, setFiles, setProductUrl, setLanguages, setStyle, reset,
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export const useVideo = () => {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideo must be used within VideoProvider");
  return ctx;
};
