export interface TweakItem {
  id: string;
  name: string;
  category: "Performance" | "System" | "Network" | "Privacy" | "Gaming";
  description: string;
  registryPath?: string;
  registryValueName?: string;
  recommended: boolean;
  applied: boolean;
  undoValue?: any;
}

export interface SystemMonitorMetrics {
  cpuUsage: number;
  ramUsage: number;
  ramTotalGb: number;
  diskReadMb: number;
  diskWriteMb: number;
  processesCount: number;
  cpuTemp: number | string;
  gpuTemp: number | string;
}

export interface StartupItem {
  id: string;
  name: string;
  command: string;
  location: "HKCU\\Run" | "HKLM\\Run" | "Startup Folder";
  enabled: boolean;
}

export interface CustomProfile {
  name: string;
  description: string;
  isCustom: boolean;
  tweakStates: Record<string, boolean>; // map and store toggle states
}

export interface LogLine {
  timestamp: string;
  level: "INFO" | "ACTION" | "ERR";
  message: string;
}
