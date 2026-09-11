"use client";
import { useEffect, useState } from "react";
import { BrowserRecognition } from "@/services/speech/browser-recognition";
export function useSpeechRecognition() {
  const [service] = useState(() => new BrowserRecognition());
  useEffect(() => () => service.abort(), [service]);
  return service;
}
