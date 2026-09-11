"use client";
import { useEffect, useState } from "react";
import { BrowserSynthesis } from "@/services/speech/browser-synthesis";
export function useSpeechSynthesis() {
  const [service] = useState(() => new BrowserSynthesis());
  useEffect(() => () => service.stop(), [service]);
  return service;
}
