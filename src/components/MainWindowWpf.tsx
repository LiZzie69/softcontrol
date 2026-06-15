import React, { useState, useEffect, useRef } from "react";
import { 
  TweakItem, 
  SystemMonitorMetrics, 
  StartupItem, 
  CustomProfile, 
  LogLine 
} from "../types";
import { 
  Cpu, 
  Zap, 
  Wifi, 
  Activity, 
  Trash2, 
  ShieldAlert, 
  Play, 
  Terminal, 
  Check, 
  X, 
  Save, 
  Undo, 
  AlertCircle, 
  HardDrive, 
  FolderLock, 
  RefreshCw,
  Clock,
  Settings,
  Grid,
  Search,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
  Shield,
  Github,
  Calendar
} from "lucide-react";

export interface ScheduledTaskItem {
  id: string;
  name: string;
  path: string;
  trigger: string;
  enabled: boolean;
  lastRun: string;
  description: string;
}

const SARCASTIC_MESSAGES = [
  "Thinking really hard... please don't touch any keys.",
  "Consulting the CPU crystal ball...",
  "Doing some computer magic...",
  "Begging the operating system not to crash...",
  "Blaming the hardware for this delay...",
  "Counting dust particles under the CPU fan...",
  "Convincing Windows that this is a critical operation...",
  "Arguing with the system event dispatcher...",
  "Downloading more RAM from the cloud...",
  "Sweeping virtual cobwebs out of memory registers...",
  "Yelling at explorer.exe to behave...",
  "Banning telemetry servers from the local playground...",
  "Adding physical speed lines to make it go faster...",
  "Polishing the processor cores with digital wax...",
  "Rewriting kernel scheduler branches on the fly..."
];

const getRandomSarcasticMsg = () => SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];

// The full list of 22 realistic Windows optimization tweaks
const CORE_22_TWEAKS: TweakItem[] = [
  { id: "Tweak_1", name: "Ultimate Performance Power Plan", category: "Performance", description: "Enables Microsoft's hidden raw energy scheme to force CPUs into maximum high-frequency state, completely disabling power throttling.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power", registryValueName: "PreferredPowerScheme" },
  { id: "Tweak_2", name: "Timer Resolution Requests Check", category: "Performance", description: "Sets system clock resolution requests globally from default 15.6ms to 0.5ms for immediate system responsiveness.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Kernel", registryValueName: "GlobalTimerResolutionRequests" },
  { id: "Tweak_3", name: "Core Parking OFF", category: "Performance", description: "Increases minimum processor cores state thresholds to 100%, preventing secondary cores from entering latency-heavy sleeps.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power", registryValueName: "CPMinCores" },
  { id: "Tweak_4", name: "EcoQoS Energy Throttling OFF", category: "Performance", description: "Disables strict Microsoft EcoQoS power management limits, preventing game processes from being forced to resource-limited cores.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power", registryValueName: "PowerThrottlingOff" },
  { id: "Tweak_5", name: "Priority Scheduling Boost", category: "Performance", description: "Configures Win32 high priority processor scheduling settings to favor active front-facing applications.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl", registryValueName: "Win32PrioritySeparation" },
  { id: "Tweak_6", name: "Disable SysMain (Superfetch)", category: "System", description: "Stops and permanently disables SysMain cache service, conserving RAM overhead and blocking heavy drive reading sessions.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\SysMain", registryValueName: "Start" },
  { id: "Tweak_7", name: "Disable DiagTrack Processes", category: "System", description: "Deactivates windows diagnostic tracking services and processes, blocking scheduled performance analytical threads.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\DiagTrack", registryValueName: "Start" },
  { id: "Tweak_8", name: "Disable Windows Search Service", category: "System", description: "Improves read workloads by turning off index background tasks (WSearch Service). Highly recommended for SSD drives.", recommended: false, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\WSearch", registryValueName: "Start" },
  { id: "Tweak_9", name: "TCP Low Latency (TCP NoDelay)", category: "Network", description: "Disables network packet buffering (Nagle's Algorithm) to instantly dispatch network frames, lowering ping times.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces", registryValueName: "TCPNoDelay" },
  { id: "Tweak_10", name: "TCP Frequency Acks Modification", category: "Network", description: "Forces network cards to immediately dispatch positive ack headers instead of buffering, ideal for competitive matches.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces", registryValueName: "TcpAckFrequency" },
  { id: "Tweak_11", name: "GPU Hardware-Accelerated Scheduling", category: "Gaming", description: "Configures GPU drivers (HwSchMode) to bypass Windows scheduler, lowering render queues and expanding frame stability.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers", registryValueName: "HwSchMode" },
  { id: "Tweak_12", name: "Windows Game Mode ON", category: "Gaming", description: "Enables native Win10/11 Game Mode to prioritize CPU & GPU instructions when window focus points to gaming executable threads.", recommended: true, applied: false, registryPath: "HKCU\\Software\\Microsoft\\GameBar", registryValueName: "AllowAutoGameMode" },
  { id: "Tweak_13", name: "Disable Fullscreen Optimizations", category: "Gaming", description: "Prevents Windows from hybrid-rendering fullscreen windows, reducing processing lag and display stuttering.", recommended: true, applied: false, registryPath: "HKCU\\System\\GameConfigStore", registryValueName: "GameDVR_FSEBehaviorMode" },
  { id: "Tweak_14", name: "Disable Mouse Acceleration", category: "Gaming", description: "Removes default pointer precision smoothing algorithms, establishing a clean 1:1 hardware sensor-to-screen coordinate mapping.", recommended: true, applied: false, registryPath: "HKCU\\Control Panel\\Mouse", registryValueName: "MouseSpeed" },
  { id: "Tweak_15", name: "Disable Windows Game Bar Overlay", category: "Gaming", description: "Turns off Microsoft Game Bar, saving system memory from background overlays and streaming DVR services.", recommended: true, applied: false, registryPath: "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR", registryValueName: "AppCaptureEnabled" },
  { id: "Tweak_16", name: "Nvidia Ultra Low Latency (ULL) Profile", category: "Gaming", description: "Enables Driver-level Maximum Frame Queuing restrictions to dramatically lower GPU processing visual latency.", recommended: true, applied: false, registryPath: "HKLM\\SOFTWARE\\NVIDIA Corporation\\Global\\System", registryValueName: "UltraLowLatencyMode" },
  { id: "Tweak_17", name: "Kill Microsoft Telemetry Registry Keys", category: "Privacy", description: "Drives 20+ registry keys to disabled states, blocking background event recorders and automated report uploads.", recommended: true, applied: false, registryPath: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection", registryValueName: "AllowTelemetry" },
  { id: "Tweak_18", name: "Force DNS static to Cloudflare", category: "Network", description: "Sets interface primary resolved nodes to high-velocity Cloudflare servers: 1.1.1.1 and 1.0.0.1.", recommended: true, applied: false, registryPath: "WMI_Interface", registryValueName: "DNSServers" },
  { id: "Tweak_19", name: "Disable USB Selective Suspend", category: "System", description: "Blocks power managers from temporarily turning off inactive USB ports, keeping mouse, keyboards, and controllers active.", recommended: true, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\2a737441-1930-4402-8d77-7dd3ea5d2fd5", registryValueName: "Attributes" },
  { id: "Tweak_20", name: "Disable Microsoft Copilot Keys", category: "Privacy", description: "Disables AI Windows Copilot features and telemetry integrations globally inside the registry policies.", recommended: true, applied: false, registryPath: "HKCU\\Software\\Policies\\Microsoft\\Windows\\WindowsCopilot", registryValueName: "TurnOffWindowsCopilot" },
  { id: "Tweak_21", name: "Disable Hibernation & Fast Startup", category: "System", description: "Frees up gigabytes of drive storage (hiberfil.sys) and ensures a clean, fresh Windows kernel state on every boot.", recommended: false, applied: false, registryPath: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power", registryValueName: "HiberbootEnabled" },
  { id: "Tweak_22", name: "Disable Advertising ID & Locations", category: "Privacy", description: "Blocks Microsoft applications from accessing custom diagnostic marketing IDs and active core GPS triangulation hardware.", recommended: true, applied: false, registryPath: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo", registryValueName: "Enabled" }
];

const DEFAULT_STARTUP_APPS: StartupItem[] = [
  { id: "S_1", name: "Discord Launcher", command: "C:\\Users\\Admin\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe", location: "HKCU\\Run", enabled: true },
  { id: "S_2", name: "Nvidia Overlay Manager", command: "C:\\Program Files\\NVIDIA Corporation\\NvContainer\\nvcontainer.exe", location: "HKLM\\Run", enabled: true },
  { id: "S_3", name: "Steam Client Hook", command: "C:\\Program Files (x86)\\Steam\\steam.exe -silent", location: "HKCU\\Run", enabled: true },
  { id: "S_4", name: "Spotify Background Task", command: "C:\\Users\\Admin\\AppData\\Roaming\\Spotify\\spotify.exe --minimized", location: "HKCU\\Run", enabled: false },
  { id: "S_5", name: "OneDrive AutoSync", command: "C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe /background", location: "HKCU\\Run", enabled: false },
];

export interface ProcessItem {
  pid: number;
  name: string;
  cpu: number;
  ram: number; // MB
  priority: "Low" | "Normal" | "Above Normal" | "High" | "Realtime";
  affinity: boolean[]; // 8 Cores e.g. [true, true, true, true, true, true, true, true]
  user: string;
}

const DEFAULT_PROCESS_LIST: ProcessItem[] = [
  { pid: 4852, name: "explorer.exe", cpu: 0.8, ram: 142.4, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "SYSTEM" },
  { pid: 14032, name: "chrome.exe", cpu: 4.2, ram: 652.8, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "User" },
  { pid: 8450, name: "discord.exe", cpu: 1.5, ram: 284.1, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "User" },
  { pid: 9112, name: "dwm.exe", cpu: 2.1, ram: 88.5, priority: "High", affinity: [true, true, true, true, true, true, true, true], user: "SYSTEM" },
  { pid: 12054, name: "VALORANT.exe", cpu: 12.4, ram: 2048.0, priority: "Above Normal", affinity: [true, true, true, true, true, true, true, true], user: "User" },
  { pid: 3204, name: "csrss.exe", cpu: 0.1, ram: 14.5, priority: "Realtime", affinity: [true, true, true, true, true, true, true, true], user: "SYSTEM" },
  { pid: 15302, name: "NvidiaShare.exe", cpu: 0.5, ram: 64.2, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "User" },
  { pid: 7420, name: "svchost.exe", cpu: 0.2, ram: 34.8, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "SYSTEM" },
  { pid: 5612, name: "GameOverlayUI.exe", cpu: 1.1, ram: 42.1, priority: "Normal", affinity: [true, true, true, true, true, true, true, true], user: "User" },
  { pid: 1104, name: "spoolsv.exe", cpu: 0.0, ram: 12.8, priority: "Low", affinity: [true, true, true, true, true, true, true, true], user: "SYSTEM" },
  { pid: 6301, name: "taskmgr.exe", cpu: 1.8, ram: 38.6, priority: "High", affinity: [true, true, true, true, true, true, true, true], user: "User" },
];

interface WpfSimulatorProps {
  onAddLog: (level: "INFO" | "ACTION" | "ERR", msg: string) => void;
  logs: LogLine[];
  onClearLogs: () => void;
}

export default function MainWindowWpf({ onAddLog, logs, onClearLogs }: WpfSimulatorProps) {
  const [activeTab, setActiveTab] = useState<string>("optimize");
  const [logsMinimized, setLogsMinimized] = useState(true);
  const [tweaks, setTweaks] = useState<TweakItem[]>(() => {
    const saved = localStorage.getItem("softcontrol_tweak_states");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map saved boolean array state to items
        return CORE_22_TWEAKS.map(tw => ({ ...tw, applied: !!parsed[tw.id] }));
      } catch (e) {
        return CORE_22_TWEAKS;
      }
    }
    return CORE_22_TWEAKS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Monitors state
  const [metrics, setMetrics] = useState<SystemMonitorMetrics>({
    cpuUsage: 14,
    ramUsage: 6.4,
    ramTotalGb: 16,
    diskReadMb: 0.1,
    diskWriteMb: 0.4,
    processesCount: 142,
    cpuTemp: 44,
    gpuTemp: 48
  });
  const [temperatureAvailable, setTemperatureAvailable] = useState<boolean>(true);
  const [cpuHistory, setCpuHistory] = useState<number[]>([15, 12, 18, 14, 16, 20, 11, 14, 15, 14]);

  // Clean sizes state
  const [scannedSizes, setScannedSizes] = useState<Record<string, { size: number; path: string; locked: boolean }> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatusText, setScanningStatusText] = useState("");
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanLogOutput, setCleanLogOutput] = useState<string[]>([]);

  // Startup apps state
  const [startupApps, setStartupApps] = useState<StartupItem[]>(() => {
    const saved = localStorage.getItem("softcontrol_startup_apps");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STARTUP_APPS;
      }
    }
    return DEFAULT_STARTUP_APPS;
  });

  // Profiles lists state
  const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>(() => {
    const saved = localStorage.getItem("softcontrol_custom_profiles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [newProfileName, setNewProfileName] = useState("");

  // Lag testing state
  const [lagState, setLagState] = useState<"idle" | "waiting" | "active" | "result">("idle");
  const [lagTimes, setLagTimes] = useState<number[]>([185, 212, 198]);
  const [lagFeedback, setLagFeedback] = useState("");
  const [lagScore, setLagScore] = useState<number | null>(null);
  const lagTimerRef = useRef<number | null>(null);
  const lagTimestampRef = useRef<number>(0);

  // Restore Point states
  const [hasRestorePoint, setHasRestorePoint] = useState(() => localStorage.getItem("softcontrol_has_restore_point") === "true");
  const [restorePointTime, setRestorePointTime] = useState(() => localStorage.getItem("softcontrol_restore_point_time") || "");
  const [neverShowRestoreWarning, setNeverShowRestoreWarning] = useState(() => localStorage.getItem("softcontrol_never_show_restore_warning") === "true");
  const [showRestoreWarningModal, setShowRestoreWarningModal] = useState(false);
  const [pendingOptimizeAction, setPendingOptimizeAction] = useState<{
    type: "toggle" | "apply_all" | "profile";
    targetId?: string;
    scope?: "recommended" | "all";
    profileName?: string;
    callback?: () => void;
  } | null>(null);

  // Selectable Bloatware, USB Cleaner, and New Advanced utility states
  const [bloatwareOptions, setBloatwareOptions] = useState(() => {
    const saved = localStorage.getItem("softcontrol_bloatware_options");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      xbox: true,
      cortana: true,
      zune: true,
      telemetry: true,
      widgets: true,
      games: false,
      edge: false,
      onedrive: true,
      teams: true,
      skype: true,
      yourPhone: true,
      maps: false,
      feedback: true,
      bingSearch: true,
      solitaire: false,
      paint3d: false,
      mixedReality: false,
      skypeVideo: true,
      help: true
    };
  });

  const [usbOptions, setUsbOptions] = useState({
    setupapi: true,
    registryKeys: true,
    readyboost: false,
    hidRecords: true,
  });

  const [isUninstallingBloatware, setIsUninstallingBloatware] = useState(false);
  const [isCleaningUsb, setIsCleaningUsb] = useState(false);

  // RAM Standby Memory cleaner states
  const [isCleaningRam, setIsCleaningRam] = useState(false);
  const [ramStatusText, setRamStatusText] = useState("");

  // Windows Update Blocker (WUB) states
  const [wubBlocked, setWubBlocked] = useState(() => localStorage.getItem("softcontrol_wub_blocked") === "true");
  const [wubProcessing, setWubProcessing] = useState(false);
  const [wubStatusMessage, setWubStatusMessage] = useState("");

  // SFC/DISM System Integrity Checker states
  const [isApplyingIntegrity, setIsApplyingIntegrity] = useState(false);
  const [integrityProgress, setIntegrityProgress] = useState(0);
  const [integrityStatusText, setIntegrityStatusText] = useState("");
  const [integrityLogs, setIntegrityLogs] = useState<string[]>([]);

  // Confirmation popups
  const [showCreateRestoreConfirm, setShowCreateRestoreConfirm] = useState(false);

  // License Status and counting timer
  const [licenseTimeLeft, setLicenseTimeLeft] = useState(174);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Appearance & UI Theme State
  const [appearanceTheme, setAppearanceTheme] = useState(() => localStorage.getItem("softcontrol_appearance_theme") || "cosmic-slate");

  // Scheduled Tasks list block
  const [scheduledTasksList, setScheduledTasksList] = useState<ScheduledTaskItem[]>(() => {
    const saved = localStorage.getItem("softcontrol_scheduled_tasks");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "ST_1", name: "Compatibility Appraiser", path: "\\Microsoft\\Windows\\Application Experience", trigger: "Daily at 3:00 AM", enabled: true, lastRun: "Yesterday at 3:04 AM", description: "Collects telemetry information about compatibility issues to send to Microsoft." },
      { id: "ST_2", name: "Consolidator", path: "\\Microsoft\\Windows\\Customer Experience Improvement Program", trigger: "Daily at 12:00 PM", enabled: true, lastRun: "Today at 12:01 PM", description: "Consolidates and uploads user reliability reports to Microsoft CEIP servers." },
      { id: "ST_3", name: "Standalone Update Task", path: "\\Microsoft\\Windows\\OneDrive", trigger: "At user logon", enabled: true, lastRun: "Today at 8:45 AM", description: "Checks for and downloads updates for Microsoft OneDrive on active sessions." },
      { id: "ST_4", name: "Scheduled Start", path: "\\Microsoft\\Windows\\WindowsUpdate", trigger: "Daily at 4:30 AM", enabled: true, lastRun: "Yesterday at 4:32 AM", description: "Initiates automatic scans and schedules patch downloads from Windows Update servers." },
      { id: "ST_5", name: "DiskDiagnosticDataCollector", path: "\\Microsoft\\Windows\\DiskDiagnostic", trigger: "At system idle", enabled: true, lastRun: "Yesterday at 11:20 PM", description: "Monitors disk read/write cycles and benchmarks general storage drive integrity." },
      { id: "ST_6", name: "WinSAT", path: "\\Microsoft\\Windows\\Maintenance", trigger: "Weekly on Sundays", enabled: true, lastRun: "Last Sunday at 2:00 AM", description: "Executes the Windows System Assessment Tool to measure graphic card and memory index scores." },
      { id: "ST_7", name: "AnalyzeSystem", path: "\\Microsoft\\Windows\\Power Efficiency Diagnostics", trigger: "On demand / logon", enabled: true, lastRun: "Today at 8:50 AM", description: "Analyzes system power utilization indicators for battery drain diagnostic sessions." },
      { id: "ST_8", name: "ScheduledDefrag", path: "\\Microsoft\\Windows\\Defrag", trigger: "Weekly on Wednesdays", enabled: false, lastRun: "Last Wednesday at 1:15 AM", description: "Scheduled disk defragmentation and SSD block TRIM optimization thread." },
      { id: "ST_9", name: "ToastReceiptsProvider", path: "\\Microsoft\\Windows\\Maps", trigger: "At user logon", enabled: true, lastRun: "Today at 8:46 AM", description: "Retrieves live map download records and tracking data overlays notifications." }
    ];
  });

  // Hotkey mapping config entries
  const [hotkeys, setHotkeys] = useState(() => {
    const saved = localStorage.getItem("softcontrol_hotkeys_config");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { action: "Clean RAM Cache", keyCombo: "Ctrl + Alt + R", isBinding: false },
      { action: "Flush DNS Cache", keyCombo: "Ctrl + Shift + F", isBinding: false },
      { action: "Block Windows Updates", keyCombo: "Ctrl + Alt + U", isBinding: false },
      { action: "Run Integrity Check", keyCombo: "Ctrl + Shift + S", isBinding: false },
      { action: "Apply All Fast Tweaks", keyCombo: "Shift + Alt + A", isBinding: false },
    ];
  });

  // Processes manager states
  const [processesList, setProcessesList] = useState<ProcessItem[]>(DEFAULT_PROCESS_LIST);
  const [processSearchInput, setProcessSearchInput] = useState("");
  const [selectedProcessForAffinity, setSelectedProcessForAffinity] = useState<number | null>(null);
  const [editingPriorityPid, setEditingPriorityPid] = useState<number | null>(null);

  // New sub tab for Process tab ("processes" or "tasks")
  const [processesSubTab, setProcessesSubTab] = useState<"processes" | "tasks">("processes");
  const [taskSearchInput, setTaskSearchInput] = useState("");
  const [editingTriggerTaskId, setEditingTriggerTaskId] = useState<string | null>(null);
  const [tempTriggerText, setTempTriggerText] = useState("");

  // Rollback dialog confirm
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const [applyScope, setApplyScope] = useState<"recommended" | "all">("recommended");
  const [applyProgress, setApplyProgress] = useState(0);

  // Local storage effects for settings
  useEffect(() => {
    localStorage.setItem("softcontrol_bloatware_options", JSON.stringify(bloatwareOptions));
  }, [bloatwareOptions]);

  useEffect(() => {
    localStorage.setItem("softcontrol_hotkeys_config", JSON.stringify(hotkeys));
  }, [hotkeys]);

  useEffect(() => {
    localStorage.setItem("softcontrol_scheduled_tasks", JSON.stringify(scheduledTasksList));
  }, [scheduledTasksList]);

  // Periodic decrement of warning licensing trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setLicenseTimeLeft(prev => {
        if (prev <= 1) return 180;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically sync triggers to localStorage
  useEffect(() => {
    const statesMap: Record<string, boolean> = {};
    tweaks.forEach(t => { statesMap[t.id] = t.applied; });
    localStorage.setItem("softcontrol_tweak_states", JSON.stringify(statesMap));
  }, [tweaks]);

  useEffect(() => {
    localStorage.setItem("softcontrol_startup_apps", JSON.stringify(startupApps));
  }, [startupApps]);

  useEffect(() => {
    localStorage.setItem("softcontrol_custom_profiles", JSON.stringify(customProfiles));
  }, [customProfiles]);

  // Simulated live WMI metric monitoring dispatcher (every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const randCpu = Math.max(2, Math.min(99, Math.round(prev.cpuUsage + (Math.random() * 10 - 5))));
        const randDiskR = Math.max(0, parseFloat((prev.diskReadMb + (Math.random() * 2 - 1)).toFixed(2)));
        const randDiskW = Math.max(0, parseFloat((prev.diskWriteMb + (Math.random() * 4 - 2)).toFixed(2)));
        const randProc = prev.processesCount + (Math.random() > 0.7 ? 1 : Math.random() < 0.3 ? -1 : 0);
        
        let newRam = parseFloat((prev.ramUsage + (Math.random() * 0.4 - 0.2)).toFixed(2));
        if (newRam > 15 || newRam < 2) newRam = 6.4;

        // Fluctuating hardware temps (WMI simulated query)
        const randCpuTemp = temperatureAvailable ? Math.max(30, Math.min(95, Math.round((prev.cpuTemp as number) + (Math.random() * 4 - 2)))) : "N/A";
        const randGpuTemp = temperatureAvailable ? Math.max(30, Math.min(88, Math.round((prev.gpuTemp as number) + (Math.random() * 3 - 1.5)))) : "N/A";

        return {
          cpuUsage: randCpu,
          ramUsage: newRam,
          ramTotalGb: prev.ramTotalGb,
          diskReadMb: randCpu > 80 ? randDiskR + 12 : randDiskR,
          diskWriteMb: randCpu > 80 ? randDiskW + 24 : randDiskW,
          processesCount: Math.round(randProc),
          cpuTemp: randCpuTemp,
          gpuTemp: randGpuTemp
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [temperatureAvailable]);

  // Sync processes list count into telemetry monitor state
  useEffect(() => {
    setMetrics(prev => ({ ...prev, processesCount: processesList.length }));
  }, [processesList.length]);

  // Fluctuating process resource values loop
  useEffect(() => {
    const procInterval = setInterval(() => {
      setProcessesList(currList => 
        currList.map(p => {
          if (p.name === "csrss.exe" || p.name === "spoolsv.exe") return p;
          
          const maxFluctuateCpu = p.name === "VALORANT.exe" ? 10 : p.name === "chrome.exe" ? 4 : 1.5;
          const randomCpuChange = (Math.random() * maxFluctuateCpu - (maxFluctuateCpu / 2));
          const nextCpu = Math.max(0.1, parseFloat((p.cpu + randomCpuChange).toFixed(1)));
          
          const ramFluctuate = Math.max(1, p.ram * 0.015);
          const randomRamChange = (Math.random() * ramFluctuate - (ramFluctuate / 2));
          const nextRam = Math.max(5, parseFloat((p.ram + randomRamChange).toFixed(1)));

          return { ...p, cpu: nextCpu, ram: nextRam };
        })
      );
    }, 2000);
    return () => clearInterval(procInterval);
  }, []);

  // Decoupled CPU history tracking to prevent nested state updates during evaluation phase
  useEffect(() => {
    setCpuHistory(hist => {
      const nextHist = [...hist.slice(1), metrics.cpuUsage];
      return nextHist;
    });
  }, [metrics.cpuUsage]);

  // Safety execution controller with System Restore Checks
  const handleOptimizationAttempt = (
    action: () => void,
    actionDesc: any
  ) => {
    if (!hasRestorePoint && !neverShowRestoreWarning) {
      setPendingOptimizeAction({ ...actionDesc, callback: action });
      setShowRestoreWarningModal(true);
    } else {
      action();
    }
  };

  // Executing RAM Cache purification routines
  const triggerRamClean = () => {
    if (isCleaningRam) return;
    setIsCleaningRam(true);
    const firstMsg = getRandomSarcasticMsg();
    setRamStatusText(firstMsg);
    onAddLog("ACTION", "[MemoryCleaner] Emptying Windows standby cache memory regions...");
    onAddLog("INFO", "Invoking kernel function: NtSetInformationProcess -ProcessInformationClass ProcessMemoryExhaustiveTrim");

    // Cycle sarcasms
    setTimeout(() => {
      setRamStatusText(getRandomSarcasticMsg());
    }, 550);

    setTimeout(() => {
      setMetrics(prev => {
        const currentBytes = prev.ramUsage;
        const savedBytes = parseFloat((2.0 + Math.random() * 1.5).toFixed(2));
        const finalRam = Math.max(1.8, parseFloat((currentBytes - savedBytes).toFixed(2)));
        onAddLog("INFO", `[Kernel] Successfully cleared active StandbyList threads. Recovered ${Math.round(savedBytes * 1024)} MB unused physical RAM.`);
        return {
          ...prev,
          ramUsage: finalRam
        };
      });
      setIsCleaningRam(false);
      onAddLog("ACTION", "[MemoryCleaner] WorkingSet cache flushed completely.");
    }, 1100);
  };

  // Windows Update Blocker trigger toggle
  const triggerWubBlock = () => {
    if (wubProcessing) return;
    setWubProcessing(true);
    const nextState = !wubBlocked;
    setWubStatusMessage(getRandomSarcasticMsg());
    onAddLog("ACTION", `[WUB] ${nextState ? "Enforcing permanent system-wide Windows Update blockage" : "Reinstalling default Windows Update components"}...`);

    setTimeout(() => {
      setWubProcessing(false);
      setWubBlocked(nextState);
      localStorage.setItem("softcontrol_wub_blocked", nextState ? "true" : "false");
      
      if (nextState) {
        onAddLog("INFO", "Permanently stopped Windows services: wuauserv, UsoSvc, waasmedic.");
        onAddLog("INFO", "Wrote registry policy key: HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\DisableWindowsUpdateAccess = 1");
        onAddLog("INFO", "Blocked Microsoft Delivery Optimization networks via security rules firewall mapping.");
      } else {
        onAddLog("INFO", "Restored update services start key values back to automatic.");
        onAddLog("INFO", "Cleared Update policies from HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate.");
      }
    }, 1300);
  };

  // SFC & DISM System verification sweep
  const triggerIntegrityCheck = () => {
    if (isApplyingIntegrity) return;
    setIsApplyingIntegrity(true);
    setIntegrityProgress(0);
    setIntegrityLogs([]);
    setIntegrityStatusText("[1/2] running: sfc /scannow...");
    onAddLog("ACTION", "[Integrity] Initializing System File Checker (SFC) scan processes...");

    const verificationLogs = [
      { prg: 10, log: "Verification phase of SFC system scan started.", status: "[1/2] sfc /scannow: Scanning system resources..." },
      { prg: 25, log: "Verifying system file integrity signatures block-by-block...", status: "[1/2] sfc /scannow: " + getRandomSarcasticMsg() },
      { prg: 45, log: "Windows Resource Protection found minor corrupt headers and successfully repaired them from store database.", status: "[1/2] sfc/scannow finished!" },
      { prg: 60, log: "Starting Deployment Image Servicing and Management (DISM.exe) component validation...", status: "[2/2] DISM /Online /Cleanup-Image /RestoreHealth..." },
      { prg: 75, log: "Querying online image metadata components catalog...", status: "[2/2] DISM: " + getRandomSarcasticMsg() },
      { prg: 90, log: "Component store cache repaired successfully. DISM transaction logged.", status: "[2/2] DISM: Finalizing repairs..." },
      { prg: 100, log: "System verification sequence completed. Everything fully sealed and authorized.", status: "System Integrity Sealed!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < verificationLogs.length) {
        const currentItem = verificationLogs[currentStep];
        setIntegrityProgress(currentItem.prg);
        setIntegrityStatusText(currentItem.status);
        setIntegrityLogs(prev => [...prev, currentItem.log]);
        onAddLog("INFO", `[Integrity] ${currentItem.log}`);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsApplyingIntegrity(false);
      }
    }, 800);
  };

  // Hotkeys global listener registrations
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (hotkeys.some(h => h.isBinding)) return;

      hotkeys.forEach(h => {
        const parts = h.keyCombo.toLowerCase().split(" + ");
        const hasCtrl = parts.includes("ctrl") || parts.includes("control");
        const hasAlt = parts.includes("alt");
        const hasShift = parts.includes("shift");
        const coreKey = parts.find(p => p !== "ctrl" && p !== "alt" && p !== "shift");

        if (
          hasCtrl === e.ctrlKey &&
          hasAlt === e.altKey &&
          hasShift === e.shiftKey &&
          coreKey && e.key.toLowerCase() === coreKey
        ) {
          e.preventDefault();
          if (h.action === "Clean RAM Cache") {
            triggerRamClean();
          } else if (h.action === "Flush DNS Cache") {
            handleFlushDns();
          } else if (h.action === "Block Windows Updates") {
            triggerWubBlock();
          } else if (h.action === "Run Integrity Check") {
            triggerIntegrityCheck();
          } else if (h.action === "Apply All Fast Tweaks") {
            handleApplyAll("all");
          }
        }
      });
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [hotkeys, wubBlocked, isCleaningRam, isApplyingIntegrity]);

  const executeRestorePointCreation = () => {
    setShowCreateRestoreConfirm(false);
    onAddLog("ACTION", "[SystemRestore] Initializing Windows System Restore snapshot core...");
    onAddLog("INFO", "Executing command: Checkpoint-Computer -Description 'SoftControl Optimizations Core RestorePoint' -RestorePointType MODIFY_SETTINGS");
    const nowStr = new Date().toLocaleString();
    setTimeout(() => {
      onAddLog("INFO", `[SystemRestore] Created checkpoint 'SoftControl Optimizations Core RestorePoint' successfully at ${nowStr}`);
      setHasRestorePoint(true);
      setRestorePointTime(nowStr);
      localStorage.setItem("softcontrol_has_restore_point", "true");
      localStorage.setItem("softcontrol_restore_point_time", nowStr);
      onAddLog("INFO", "Restore Checkpoint successfully stored inside NTFS shadow blocks database.");
    }, 700);
  };

  const triggerCreateRestorePoint = () => {
    setShowCreateRestoreConfirm(true);
  };

  // Handle single tweak apply action toggle
  const handleToggleTweak = (id: string) => {
    const run = () => {
      const targetTweak = tweaks.find(tw => tw.id === id);
      if (!targetTweak) return;
      
      const nextState = !targetTweak.applied;
      onAddLog("ACTION", `[Registry] Modifying Tweak: ${targetTweak.name} (Value: ${nextState ? "Enabling" : "Disabling"})`);
      onAddLog("INFO", `Set Key: ${targetTweak.registryPath}\\${targetTweak.registryValueName} = ${nextState ? "1" : "0"}`);
      
      setTweaks(prev => prev.map(tw => tw.id === id ? { ...tw, applied: nextState } : tw));
    };

    handleOptimizationAttempt(run, { type: "toggle", targetId: id });
  };

  // Profile presets applier
  const applyProfile = (name: string) => {
    const run = () => {
      onAddLog("ACTION", `[Profile] Applying Preset Configuration: "${name}"`);
      let activeIds: string[] = [];
      
      if (name === "Competitive FPS") {
        activeIds = ["Tweak_1", "Tweak_2", "Tweak_3", "Tweak_4", "Tweak_5", "Tweak_9", "Tweak_10", "Tweak_11", "Tweak_12", "Tweak_13", "Tweak_14", "Tweak_15", "Tweak_16"];
      } else if (name === "Streaming") {
        activeIds = ["Tweak_1", "Tweak_2", "Tweak_3", "Tweak_5", "Tweak_11", "Tweak_12", "Tweak_13", "Tweak_17", "Tweak_19", "Tweak_20"];
      } else if (name === "Low Latency") {
        activeIds = ["Tweak_2", "Tweak_3", "Tweak_4", "Tweak_9", "Tweak_10", "Tweak_14", "Tweak_16", "Tweak_18"];
      } else if (name === "Balanced") {
        activeIds = ["Tweak_1", "Tweak_6", "Tweak_7", "Tweak_12", "Tweak_17", "Tweak_22"];
      } else if (name === "Power Saver") {
        // Disables most gaming and high-frequency modes
        activeIds = ["Tweak_6", "Tweak_7", "Tweak_22"];
      }

      setTweaks(prev => prev.map(tw => ({
        ...tw,
        applied: activeIds.includes(tw.id)
      })));

      onAddLog("INFO", `Successfully matched and activated ${activeIds.length} tweaks under selected profile.`);
    };

    handleOptimizationAttempt(run, { type: "profile", profileName: name });
  };

  // Custom JSON Profile Saving
  const handleSaveCustomProfile = () => {
    if (!newProfileName.trim()) {
      alert("Please enter a valid, non-empty profile name.");
      return;
    }
    const tweakStates: Record<string, boolean> = {};
    tweaks.forEach(t => {
      tweakStates[t.id] = t.applied;
    });

    const newProfile: CustomProfile = {
      name: newProfileName,
      description: "Custom user config saved via Profiles Manager",
      isCustom: true,
      tweakStates
    };

    setCustomProfiles(prev => [...prev.filter(p => p.name !== newProfile.name), newProfile]);
    onAddLog("ACTION", `[Profile] Custom configuration profile saved on storage as settings.json entry: "${newProfileName}"`);
    setNewProfileName("");
  };

  const loadCustomProfile = (prof: CustomProfile) => {
    onAddLog("ACTION", `[Profile] Loading JSON Profile Settings: "${prof.name}"`);
    setTweaks(prev => prev.map(tw => ({
      ...tw,
      applied: !!prof.tweakStates[tw.id]
    })));
    onAddLog("INFO", `Profile "${prof.name}" mapping successfully loaded into memory.`);
  };

  const deleteCustomProfile = (name: string) => {
    setCustomProfiles(prev => prev.filter(p => p.name !== name));
    onAddLog("ACTION", `[Profile] Removed custom JSON setting record: "${name}"`);
  };

  // Apply Batch Optimizations (With Progress loader)
  const handleApplyAll = (scope: "recommended" | "all" = "recommended") => {
    const run = () => {
      setApplyScope(scope);
      setIsApplyingAll(true);
      setApplyProgress(0);
      onAddLog("ACTION", `Starting high-speed batch system configuration pipeline [Scope: ${scope === "all" ? "ALL" : "RECOMMENDED"}]...`);

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsApplyingAll(false);
          setApplyProgress(100);
          if (scope === "all") {
            // Set all to True
            setTweaks(tList => tList.map(t => ({ ...t, applied: true })));
            onAddLog("ACTION", "Batch pipeline executed. 22/22 High Performance Tweaks applied successfully inside secure thread.");
          } else {
            // Set all recommended ones to True
            setTweaks(tList => tList.map(t => t.recommended ? { ...t, applied: true } : t));
            onAddLog("ACTION", "Batch pipeline executed. 18/22 Recommended Tweaks applied successfully inside secure thread.");
          }
        } else {
          setApplyProgress(currentProgress);
          // Push intermediate logs during progress cleanly
          if (currentProgress === 20) onAddLog("INFO", "[System] Generating powercfg /duplicatescheme e9a42b02 Ultimate Energy Schema...");
          if (currentProgress === 40) onAddLog("INFO", "[Network] Patching registry values TcpAckFrequency=1 & TCPNoDelay=1 across active NICs...");
          if (currentProgress === 60) onAddLog("INFO", "[System] Stopping active Telemetry services (DiagTrack, dmwappushservice)...");
          if (currentProgress === 80) onAddLog("INFO", "[Gaming] Overriding FullScreen optimizations overlays system preferences...");
        }
      }, 200);
    };

    handleOptimizationAttempt(run, { type: "apply_all", scope });
  };

  // Undo (Rollback all Tweaks)
  const handleRollback = () => {
    setShowRollbackConfirm(false);
    onAddLog("ACTION", "[ROLLBACK] Reversing all applied registry tweaks and services to default states...");
    
    // Simulate real delay
    setTimeout(() => {
      setTweaks(prev => prev.map(tw => ({ ...tw, applied: false })));
      onAddLog("INFO", "[ROLLBACK] Shell command 'sc config SysMain start= auto' scheduled.");
      onAddLog("INFO", "[ROLLBACK] Deleted registry keys TcpAckFrequency and TCPNoDelay under interfaces.");
      onAddLog("INFO", "[ROLLBACK] Reverted mouse cursor acceleration configurations.");
      onAddLog("INFO", "[ROLLBACK] Restored location tracking permissions, fast startup telemetry values, and reset DNS resolution.");
      onAddLog("ACTION", "[ROLLBACK EFFECTIVE] All parameters safely recovered to default Microsoft structures. Reboot recommended.");
    }, 800);
  };

  // Smart Clean Scanner (Browser Locking warnings simulation)
  const handleScanNow = () => {
    setIsScanning(true);
    setScannedSizes(null);
    setScanningStatusText(getRandomSarcasticMsg());
    onAddLog("ACTION", "[Scanner] Querying disk directories index mapping structures...");

    let textCycleIndex = 0;
    const intervalId = setInterval(() => {
      setScanningStatusText(getRandomSarcasticMsg());
    }, 450);

    setTimeout(() => {
      clearInterval(intervalId);
      const resultData = {
        userTemp: { size: 1250, path: "C:\\Users\\Admin\\AppData\\Local\\Temp", locked: false },
        winTemp: { size: 3410, path: "C:\\Windows\\Temp", locked: false },
        winUpdate: { size: 4096, path: "C:\\Windows\\SoftwareDistribution\\Download", locked: false },
        prefetch: { size: 12.4, path: "C:\\Windows\\Prefetch", locked: false },
        thumbnails: { size: 245, path: "C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Windows\\Explorer", locked: false },
        edgeCache: { size: 552, path: "C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache", locked: true }, // Locked because browser open simulation
        chromeCache: { size: 1120, path: "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache", locked: false },
        firefoxCache: { size: 0, path: "C:\\Users\\Admin\\AppData\\Local\\Mozilla\\Firefox\\Profiles", locked: false }
      };
      setScannedSizes(resultData);
      setIsScanning(false);
      onAddLog("INFO", `Scan Complete. Detected a total of 10,685.40 MB (10.43 GB) volatile storage assets ready to clear.`);
    }, 1500);
  };

  const handleCleanNow = () => {
    if (!scannedSizes) {
      alert("Please execute dry scan sizes analysis before triggering live clean operations.");
      return;
    }
    setIsCleaning(true);
    setCleanLogOutput([]);
    onAddLog("ACTION", "[Clean] Locking target files and releasing volatile folder descriptors...");

    const logStatements = [
      "Accessing directory C:\\Users\\Admin\\AppData\\Local\\Temp...",
      "Deleted 14,249 temp handles. Freed 1.25 GB.",
      "Accessing directory C:\\Windows\\Temp...",
      "Deleted 823 locks successfully. Freed 3.41 GB.",
      "Accessing directory C:\\Windows\\SoftwareDistribution\\Download...",
      "Executing sub-routine: Stop-Service wuauserv prior to folder delete...",
      "Cleared Windows Update Delivery Optimization database. Freed 4.10 GB.",
      "Warning: Skip locked browser file: C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache\\data_0 (File currently being written by MicrosoftEdge.exe. Safe alert - Skipped.)",
      "Accessing directory C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache...",
      "Cleared Chrome assets cache directories. Freed 1.12 GB."
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logStatements.length) {
        const text = logStatements[step];
        setCleanLogOutput(prev => [...prev, text]);
        if (text.includes("Warning:")) {
          onAddLog("ERR", `[Skip locked] Edge browser open. Skipped active locked cache handles securely.`);
        } else {
          onAddLog("INFO", `[Cleaner] ${text}`);
        }
        step++;
      } else {
        clearInterval(interval);
        setIsCleaning(false);
        // Clear except locked edge
        setScannedSizes({
          userTemp: { size: 0, path: "C:\\Users\\Admin\\AppData\\Local\\Temp", locked: false },
          winTemp: { size: 0, path: "C:\\Windows\\Temp", locked: false },
          winUpdate: { size: 0, path: "C:\\Windows\\SoftwareDistribution\\Download", locked: false },
          prefetch: { size: 0, path: "C:\\Windows\\Prefetch", locked: false },
          thumbnails: { size: 0, path: "C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Windows\\Explorer", locked: false },
          edgeCache: { size: 552, path: "C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache", locked: true },
          chromeCache: { size: 0, path: "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache", locked: false },
          firefoxCache: { size: 0, path: "C:\\Users\\Admin\\AppData\\Local\\Mozilla\\Firefox\\Profiles", locked: false }
        });
        onAddLog("ACTION", "Cache purification sequence finished. Skipped edge browser database, cleaned standard parameters.");
      }
    }, 180);
  };

  // Startup app configuration editing
  const toggleStartupApp = (id: string) => {
    const targetApp = startupApps.find(app => app.id === id);
    if (!targetApp) return;

    const nextState = !targetApp.enabled;
    onAddLog("ACTION", `[Startup] Customizing startup trigger: ${targetApp.name} (${nextState ? "Enabled" : "Disabled"})`);
    onAddLog("INFO", `Writing binary block StartupApproved flags to Registry key: ${nextState ? "Active" : "Disabled (TaskMgr Approved block applied)"}`);

    setStartupApps(prev => prev.map(app => app.id === id ? { ...app, enabled: nextState } : app));
  };

  // Lag testing click reactions (Uses React timers simulating WPF system execution clocks)
  const startLagTest = () => {
    setLagState("waiting");
    setLagFeedback("Focus on the panel below... Do not click yet.");
    setLagScore(null);
    onAddLog("ACTION", "[Lag Tester] Initialized high-precision thread block stopwatch counter. Awaiting random interval...");

    const delay = 1000 + Math.random() * 2000; // 1 to 3 seconds random
    lagTimerRef.current = window.setTimeout(() => {
      setLagState("active");
      setLagFeedback("CLICK NOW!");
      lagTimestampRef.current = performance.now(); // High-precision microsecond browser clock equivalent to Stopwatch.GetTimestamp()
    }, delay);
  };

  const handleLagClick = () => {
    if (lagState === "waiting") {
      // Clicked too early!
      if (lagTimerRef.current) clearTimeout(lagTimerRef.current);
      setLagState("idle");
      setLagFeedback("Triggered too early! Wait for GREEN visual flash.");
      onAddLog("ERR", "[Lag Tester] Click registered prior to event timestamp anchor. Resetting precision stopwatch.");
      return;
    }
    if (lagState === "active") {
      const clickTime = performance.now();
      const elapsed = Math.round(clickTime - lagTimestampRef.current);
      setLagScore(elapsed);
      setLagTimes(prev => [elapsed, ...prev].slice(0, 10)); // Keep last 10 trials
      setLagState("result");
      setLagFeedback(`Latency Raw calculation yields: ${elapsed} ms`);
      onAddLog("INFO", `[Lag Tester] React input interrupt processed. Result: ${elapsed}ms (High-precision tick standard validation success).`);
    }
  };

  const handleSaveScheduledTaskTrigger = (id: string, nextTrigger: string) => {
    setScheduledTasksList(curr => curr.map(t => t.id === id ? { ...t, trigger: nextTrigger } : t));
    onAddLog("ACTION", `[Scheduler] Reconfigured execution schedule for task ID ${id}...`);
    onAddLog("INFO", `Schedule trigger parameter updated to: '${nextTrigger}'`);
    setEditingTriggerTaskId(null);
  };

  const handleToggleScheduledTask = (id: string) => {
    setScheduledTasksList(curr => curr.map(t => {
      if (t.id === id) {
        const nextState = !t.enabled;
        onAddLog("ACTION", `[Scheduler] ${nextState ? "Enabling" : "Disabling"} scheduled task '${t.name}'...`);
        onAddLog("INFO", `Task '${t.name}' status is now set to ${nextState ? "ACTIVE" : "DISABLED"}`);
        return { ...t, enabled: nextState };
      }
      return t;
    }));
  };

  const handleCleanEvents = () => {
    onAddLog("ACTION", "[Shell] Executing Powershell wevtutil clear logs routine...");
    onAddLog("INFO", "Running power-script sequence in background: wevtutil el | ForEach-Object {wevtutil cl $_}");
    setTimeout(() => {
      onAddLog("INFO", "Purged 142 distinct operational windows event logs channel blocks.");
      alert("Cleared Windows Event Logs successfully!");
    }, 650);
  };

  const handleFlushDns = () => {
    onAddLog("ACTION", "[Shell] Purging DNS Cache server addresses...");
    onAddLog("INFO", "Executing command: ipconfig /flushdns");
    setTimeout(() => {
      onAddLog("INFO", "Windows IP configuration: Successfully flushed the DNS Resolver Cache.");
      alert("DNS resolver cache cleared!");
    }, 400);
  };

  const handleCleanUsb = () => {
    const selectedKeys = Object.entries(usbOptions)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    if (selectedKeys.length === 0) {
      alert("Please select at least one USB cleaning option!");
      return;
    }

    setIsCleaningUsb(true);
    onAddLog("ACTION", "[Registry] Initializing selective USB hardware driver history sweep...");

    setTimeout(() => {
      let count = 0;
      if (usbOptions.setupapi) {
        onAddLog("INFO", "Opening log path: C:\\Windows\\inf\\setupapi.dev.log...");
        onAddLog("INFO", "Sanitized human-readable USB insertion trails and hardware vendor identifiers.");
        count++;
      }
      setTimeout(() => {
        if (usbOptions.registryKeys) {
          onAddLog("INFO", "Wiping registry branch: HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR...");
          onAddLog("INFO", "Cleared inactive device physical address parameters keys successfully.");
          count++;
        }
        setTimeout(() => {
          if (usbOptions.readyboost) {
            onAddLog("INFO", "Clearing ReadyBoost temporary configuration descriptors and device speed signatures...");
            count++;
          }
          if (usbOptions.hidRecords) {
            onAddLog("INFO", "Eradications triggered on redundant disconnected Human Interface Device (HID) logs.");
            count++;
          }

          onAddLog("ACTION", `[Registry] USB Cleanup complete. Purged ${count} distinct USB device tracking namespaces.`);
          setIsCleaningUsb(false);
          alert("Selected USB history indices and driver trails removed successfully!");
        }, 450);
      }, 350);
    }, 400);
  };

  const handleUninstallBloatware = () => {
    const selectedKeys = Object.entries(bloatwareOptions)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    if (selectedKeys.length === 0) {
      alert("Please select at least one bloatware category to remove!");
      return;
    }

    setIsUninstallingBloatware(true);
    onAddLog("ACTION", "[PowerShell] Initializing customized provisioning packages removal sequence...");
    
    // Staggered detailed log outcomes based on ticked options
    setTimeout(() => {
      let count = 0;
      if (bloatwareOptions.xbox) {
        onAddLog("INFO", "Executing command: Get-AppxPackage *Xbox* | Remove-AppxPackage");
        onAddLog("INFO", "Successfully removed Microsoft.XboxGamingOverlay and helper drivers.");
        count++;
      }
      setTimeout(() => {
        if (bloatwareOptions.cortana) {
          onAddLog("INFO", "Executing command: Get-AppxPackage *549981C3F5F10* | Remove-AppxPackage");
          onAddLog("INFO", "Cortana system voice search index de-provisioned successfully.");
          count++;
        }
        setTimeout(() => {
          if (bloatwareOptions.zune) {
            onAddLog("INFO", "Executing command: Get-AppxPackage *zune* | Remove-AppxPackage");
            onAddLog("INFO", "Legacy Zune Music & Video player packages eradicated.");
            count++;
          }
          setTimeout(() => {
            if (bloatwareOptions.telemetry) {
              onAddLog("INFO", "Disabling default Microsoft advertising telemetry appx packages...");
              onAddLog("INFO", "Unified telemetry client feedback packages purged.");
              count++;
            }
            if (bloatwareOptions.widgets) {
              onAddLog("INFO", "Eradicating BingWeather, News Feed widgets and taskbar shortcuts...");
              count++;
            }
            if (bloatwareOptions.games) {
              onAddLog("INFO", "Removed pre-installed placeholder game packages (Candy Crush, Solitaire Hub)...");
              count++;
            }

            onAddLog("ACTION", `[PowerShell] Cleaned ${count} active bloatware layers from provisioned system packages database storage.`);
            setIsUninstallingBloatware(false);
            alert("Selected Bloatware uninstalled successfully via PowerShell package controller!");
          }, 400);
        }, 300);
      }, 350);
    }, 400);
  };

  const handleEndTask = (pid: number, name: string) => {
    setProcessesList(curr => curr.filter(p => p.pid !== pid));
    onAddLog("ACTION", `[TaskMgr] Terminated active background process: ${name} (PID: ${pid})`);
    onAddLog("INFO", "Sent memory exit interrupt instruction. Garbage collection swept physical allocation blocks.");
  };

  // Filter tweaks helper
  const filteredTweaks = tweaks.filter(t => {
    const matchCat = categoryFilter === "All" || t.category === categoryFilter;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate stats
  const getThemeHighlight = () => {
    switch (appearanceTheme) {
      case "cyberpunk": return "#EC4899";
      case "win98": return "#008080";
      case "matrix": return "#10B981";
      case "carbon": return "#94A3B8";
      case "gold": return "#EAB308";
      default: return "#7C5CFF";
    }
  };

  const generateThemeStyles = () => {
    const primaryColor = getThemeHighlight();
    let dynamicStyles = `
      :root {
        --theme-primary: ${primaryColor};
      }
      .text-\\[\\#7C5CFF\\] { color: ${primaryColor} !important; }
      .bg-\\[\\#7C5CFF\\] { background-color: ${primaryColor} !important; }
      .border-\\[\\#7C5CFF\\] { border-color: ${primaryColor} !important; }
      .from-\\[\\#7C5CFF\\] { --tw-gradient-from: ${primaryColor} !important; }
      .to-\\[\\#6c4be0\\] { --tw-gradient-to: ${primaryColor}99 !important; }
      .to-\\[\\#6b47ff\\] { --tw-gradient-to: ${primaryColor}88 !important; }
      .border-\\[\\#7C5CFF\\]\\/30 { border-color: ${primaryColor}4d !important; }
      .border-\\[\\#7C5CFF\\]\\/10 { border-color: ${primaryColor}1a !important; }
      .bg-purple-950\\/20 { background-color: ${primaryColor}1a !important; }
      .shadow-\\[0_0_10px_rgba\\(124\\,92\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px ${primaryColor}66 !important; }
    `;

    if (appearanceTheme === "cyberpunk") {
      dynamicStyles += `
        #wpf-interface-panel, .bg-\\[\\#090A0F\\], .bg-\\[\\#13151D\\], .bg-\\[\\#1A1D28\\] {
          background-color: #0c0817 !important;
          border-color: #EC48992a !important;
        }
        #wpf-header-bar {
          background-color: #120921 !important;
          border-bottom: 2px solid #EC489950 !important;
        }
        aside {
          background-color: #090312 !important;
        }
      `;
    } else if (appearanceTheme === "win98") {
      dynamicStyles += `
        #wpf-interface-panel, .bg-\\[\\#090A0F\\], .bg-\\[\\#13151D\\], .bg-\\[\\#1A1D28\\] {
          background-color: #D4D0C8 !important;
          color: #000000 !important;
          border-color: #808080 !important;
        }
        #wpf-header-bar {
          background: linear-gradient(90deg, #000080, #1084D0) !important;
          color: #FFFFFF !important;
        }
        aside {
          background-color: #D4D0C8 !important;
          border-right: 2px solid #808080 !important;
        }
        .text-slate-400, .text-slate-300, .text-slate-450, .text-slate-455 {
          color: #111111 !important;
        }
        span, h2, h3, h4, p, label, svg {
          color: #000000 !important;
        }
        polyline {
          stroke: #008080 !important;
        }
      `;
    } else if (appearanceTheme === "matrix") {
      dynamicStyles += `
        #wpf-interface-panel, .bg-\\[\\#090A0F\\], .bg-\\[\\#13151D\\], .bg-\\[\\#1A1D28\\] {
          background-color: #010400 !important;
          color: #10B981 !important;
          border-color: #047857 !important;
        }
        #wpf-header-bar {
          background-color: #020804 !important;
          border-bottom: 2px solid #10B981 !important;
        }
        aside {
          background-color: #010401 !important;
        }
        span, h2, h3, h4, p, label, button, svg {
          color: #10B981 !important;
        }
        polyline {
          stroke: #10B981 !important;
        }
      `;
    } else if (appearanceTheme === "carbon") {
      dynamicStyles += `
        #wpf-interface-panel, .bg-\\[\\#090A0F\\], .bg-\\[\\#13151D\\], .bg-\\[\\#1A1D28\\] {
          background-color: #121212 !important;
          border-color: #333333 !important;
        }
        #wpf-header-bar {
          background-color: #1A1A1A !important;
          border-bottom: 1px solid #333333 !important;
        }
        aside {
          background-color: #151515 !important;
        }
      `;
    } else if (appearanceTheme === "gold") {
      dynamicStyles += `
        #wpf-interface-panel, .bg-\\[\\#090A0F\\], .bg-\\[\\#13151D\\], .bg-\\[\\#1A1D28\\] {
          background-color: #050b14 !important;
          border-color: #EAB30833 !important;
        }
        #wpf-header-bar {
          background-color: #091322 !important;
          border-bottom: 2px solid #EAB30855 !important;
        }
        aside {
          background-color: #03080f !important;
        }
      `;
    }

    return dynamicStyles;
  };

  const totalApplied = tweaks.filter(t => t.applied).length;
  const healthScore = Math.max(0, Math.min(100, 100 - (tweaks.length - totalApplied) * 4));

  return (
    <div id="wpf-frame-container" className="font-sans text-[#F8FAFC] select-none text-sm p-1 rounded-2xl bg-slate-950/60 border border-[#1A1D28] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
      <style>{generateThemeStyles()}</style>
      
      {/* Real Borderless Simulation Wrapper */}
      <div id="wpf-interface-panel" className="bg-[#090A0F] border border-[#1A1D28] rounded-xl flex flex-col min-h-[660px] max-h-[720px] overflow-hidden">
        
        {/* Custom Draggable Title Bar */}
        <div id="wpf-header-bar" className="h-10 bg-[#0d0f17] flex items-center justify-between px-4 border-b border-[#1A1D28] cursor-default">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#7C5CFF] rounded shadow-[0_0_10px_rgba(124,92,255,0.4)] flex items-center justify-center text-[10px] font-bold italic">SC</div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              SoftControl <span className="text-[#7C5CFF]">v2.1</span>
            </span>
            
            {/* Shiny Clickable Links */}
            <div className="flex items-center gap-2 ml-3">
              <span className="text-[10px] text-slate-600 font-mono select-none">//</span>
              <a 
                href="https://guns.lol/softregs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1A1D28]/50 border border-[#7C5CFF]/30 hover:border-[#7C5CFF] text-slate-300 hover:text-white transition-all duration-200 relative overflow-hidden group cursor-pointer"
              >
                <span className="relative z-10">Socials</span>
                <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#7C5CFF] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>

              <a 
                href="https://github.com/softregs/SoftControl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1A1D28]/50 border border-[#7C5CFF]/30 hover:border-[#7C5CFF] text-slate-300 hover:text-white transition-all duration-200 relative overflow-hidden group flex items-center gap-1 cursor-pointer"
              >
                <Github className="w-2.5 h-2.5 text-slate-400 group-hover:text-white" />
                <span className="relative z-10">GitHub</span>
                <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#7C5CFF] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>

              <a 
                href="https://ko-fi.com/softregs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-[#ea580c]/15 to-[#f59e0b]/15 hover:from-[#ea580c]/30 hover:to-[#f59e0b]/30 border border-dashed border-[#ea580c]/40 hover:border-[#ea580c] text-orange-405 hover:text-orange-300 transition-all duration-300 relative overflow-hidden group shadow-[0_0_6px_rgba(234,88,12,0.15)] hover:shadow-[0_0_12px_rgba(234,88,12,0.4)] cursor-pointer"
              >
                <span className="absolute -inset-y-12 w-2 bg-white/25 -rotate-45 -translate-x-8 group-hover:translate-x-12 transition-transform duration-1000 ease-out"></span>
                <span className="relative z-10">Donate ✨</span>
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-[#1A1D28] rounded text-[10px] text-emerald-400 font-mono border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM SECURE // ADMIN
            </div>

            {/* Custom Settings Tab Trigger */}
            <button 
              onClick={() => {
                setActiveTab("settings");
                onAddLog("ACTION", "[Navigation] Opened System Settings Configuration Console.");
              }}
              className={`flex items-center gap-1.5 px-2 bg-slate-900 border text-[10px] font-mono rounded h-[22.5px] transition-all duration-200 cursor-pointer ${
                activeTab === "settings"
                  ? "border-[#7C5CFF] text-[#7C5CFF] bg-[#7C5CFF]/10 font-bold"
                  : "border-white/5 text-slate-400 hover:text-white hover:border-slate-650"
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Settings</span>
            </button>

            <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
              <button className="hover:text-white transition cursor-pointer">—</button>
              <button className="hover:text-white transition cursor-pointer">▢</button>
              <button className="hover:text-red-500 transition cursor-pointer font-bold" onClick={() => onAddLog("INFO", "Simulation exit blocked. Use tab actions.")}>✕</button>
            </div>
          </div>
        </div>

        {/* Master WPF Side+Main Grid split */}
        <div id="wpf-layout-body" className="flex flex-1 overflow-hidden">
          
          {/* Navigation Sidebar Drawer */}
          <aside id="wpf-sidebar" className="w-56 bg-[#13151D] border-r border-[#1A1D28] flex flex-col py-4 justify-between">
            <div className="space-y-1 px-2">
              <div className="px-3 py-1 mb-2">
                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Main Dashboard</p>
              </div>

              <button 
                id="sidebar-opt"
                onClick={() => setActiveTab("optimize")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "optimize" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Optimize Tweaks</span>
              </button>
              <button 
                id="sidebar-net"
                onClick={() => setActiveTab("network")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "network" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Wifi className="w-4 h-4" />
                <span>Network Details</span>
              </button>

              <button 
                id="sidebar-mon"
                onClick={() => setActiveTab("monitor")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "monitor" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Diagnostic Monitor</span>
              </button>

              <button 
                id="sidebar-clean"
                onClick={() => setActiveTab("clean")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "clean" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Smart Clean</span>
              </button>

              <div className="px-3 py-2 mt-4">
                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Maintenance</p>
              </div>

              <button 
                id="sidebar-priv"
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "privacy" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Privacy &amp; Cleanup</span>
              </button>

              <button 
                id="sidebar-processes"
                onClick={() => setActiveTab("processes")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "processes" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Process Manager</span>
              </button>

              <button 
                id="sidebar-startup"
                onClick={() => setActiveTab("startup")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "startup" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Startup Apps</span>
              </button>

              <button 
                id="sidebar-prof"
                onClick={() => setActiveTab("profiles")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "profiles" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Tweak Profiles</span>
              </button>

              <button 
                id="sidebar-reaction"
                onClick={() => setActiveTab("lag")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "lag" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>High Precision Lag Test</span>
              </button>

              <button 
                id="sidebar-settings"
                onClick={() => {
                  setActiveTab("settings");
                  onAddLog("ACTION", "[Navigation] Navigating to system Settings configuration tab.");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition duration-200 text-left ${
                  activeTab === "settings" 
                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D28]/30"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </button>
            </div>

            {/* Health Meter Widget bottom panel matching Design */}
            <div className="space-y-4">
              <div className="mx-3 p-3 bg-[#1A1D28] rounded-xl border border-[#7C5CFF]/20">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-450 uppercase">Tweak Health</span>
                  <span className="text-[10px] text-[#7C5CFF] font-mono font-bold tracking-tight">{totalApplied}/{tweaks.length}</span>
                </div>
                <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-[#7C5CFF] transition-all duration-300" style={{ width: `${healthScore}%` }}></div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>OPTIMIZED LEVEL</span>
                  <span className="text-emerald-400">{healthScore}%</span>
                </div>
              </div>

              <div className="px-3 flex items-center gap-2 text-[10px] text-slate-500 pb-1">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> ADMINISTRATOR MODE
              </div>

              {/* Shiny clickable links for Softregs socials and ko-fi support */}
              <div className="mx-3 mt-1.5 p-2 bg-[#1A1D28]/35 hover:bg-[#1A1D28]/55 border border-[#1A1D28] hover:border-[#7C5CFF]/30 rounded-xl space-y-2 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-[#7C5CFF] tracking-wider uppercase select-none">
                  <span>Softregs Link Hub</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                </div>
                
                <div className="grid grid-cols-3 gap-1 text-[9px]">
                  <a 
                    href="https://guns.lol/softregs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-[#090A0F] border border-[#1A1D28] hover:border-[#7C5CFF]/40 text-slate-350 hover:text-white transition duration-200 group relative overflow-hidden text-center cursor-pointer whitespace-nowrap"
                  >
                    <span className="relative z-10 font-bold">Socials</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </a>

                  <a 
                    href="https://github.com/softregs/SoftControl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-[#090A0F] border border-[#1A1D28] hover:border-[#7C5CFF]/40 text-slate-350 hover:text-white transition duration-200 group relative overflow-hidden text-center cursor-pointer whitespace-nowrap"
                  >
                    <Github className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    <span className="relative z-10 font-bold">Source</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </a>

                  <a 
                    href="https://ko-fi.com/softregs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-gradient-to-r from-[#ea580c]/12 to-[#f59e0b]/12 hover:from-[#ea580c]/25 hover:to-[#f59e0b]/25 border border-dashed border-[#ea580c]/30 hover:border-[#ea580c] text-orange-400 hover:text-orange-300 font-bold transition duration-300 group relative overflow-hidden shadow-[0_0_8px_rgba(234,88,12,0.1)] hover:shadow-[0_0_15px_rgba(234,88,12,0.3)] text-center cursor-pointer whitespace-nowrap"
                  >
                    <span className="absolute -inset-y-12 w-2 bg-white/20 -rotate-45 -translate-x-12 group-hover:translate-x-20 transition-transform duration-1000 ease-out"></span>
                    <span className="relative z-10">Donate</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Dynamic Content Frame */}
          <main id="wpf-content-panel" className="flex-1 flex flex-col min-w-0 bg-[#090A0F] overflow-y-auto p-6 space-y-6 scrollbar-thin">
            
            {/* Optimize Tweak Grid Tab */}
            {activeTab === "optimize" && (
              <div id="tab-optimize" className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1A1D28] pb-4 gap-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Windows Active Tweak Registry Configurator</h2>
                    <p className="text-xs text-slate-400">Apply performance changes directly to HKLM &amp; HKCU system directories.</p>
                  </div>
                  
                  {/* Action row with Progress meter simulation */}
                  <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                    {isApplyingAll ? (
                      <div className="flex items-center space-x-2 w-full sm:w-[180px] bg-[#1A1D28] border border-[#7C5CFF]/30 rounded-lg px-2.5 py-1.5 font-mono text-xs">
                        <RefreshCw className="w-3.5 h-3.5 text-[#7C5CFF] animate-spin" />
                        <span className="text-slate-300">Applying ({applyScope === "all" ? "All" : "Recs"}): {applyProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleApplyAll("recommended")} 
                          className="px-3.5 py-2 bg-gradient-to-r from-[#7C5CFF] to-[#6c4be0] text-white hover:opacity-90 active:scale-95 text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFF]/20 transition cursor-pointer"
                        >
                          Apply Recommended
                        </button>
                        <button 
                          onClick={() => handleApplyAll("all")} 
                          className="px-3.5 py-2 bg-[#1A1D28] text-white hover:bg-[#252836] hover:border-[#7C5CFF]/30 border border-white/5 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Apply All
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setShowRollbackConfirm(true)} 
                      className="px-3 py-2 bg-[#1A1D28] text-white hover:bg-[#252836] border border-white/5 text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Undo className="w-3.5 h-3.5 text-slate-450" />
                      <span>Undo All</span>
                    </button>
                  </div>
                </div>

                {/* Top Action Widgets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Backup Restore Checkpoint */}
                  <div className="bg-[#13151D] border border-amber-500/15 bg-gradient-to-br from-[#13151D] to-amber-500/5 rounded-2xl p-4 flex flex-col justify-between space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl select-none shrink-0 border border-amber-500/15">
                        <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-white font-mono font-bold uppercase tracking-wide">
                          <span>Create System Restore Checkpoint</span>
                          <span className="text-[8px] px-1 bg-amber-500 text-slate-950 rounded font-sans uppercase font-extrabold animate-pulse">RECOMMENDED</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-sans font-normal text-[11px]">
                          We strongly recommend establishing a snapshot before conducting low-level registry manipulations. It permits full rollback capability.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="min-w-0">
                        {hasRestorePoint ? (
                          <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold shrink-0" />
                            <span className="truncate">Checkpoint safe: {restorePointTime}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-mono font-bold block">
                            * No backup snapshot registered.
                          </span>
                        )}
                      </div>
                      <button
                        onClick={triggerCreateRestorePoint}
                        className={`px-3 py-1.5 rounded-xl font-bold transition duration-200 uppercase tracking-wider text-[10px] font-mono select-none cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                          hasRestorePoint
                            ? "bg-slate-950 border border-[#7C5CFF]/30 text-slate-300 hover:text-white"
                            : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-950/20"
                        }`}
                      >
                        <Save className="w-3 h-3" />
                        <span>{hasRestorePoint ? "Re-create checkpoint" : "Create Restore"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Windows Update Blocker Shield */}
                  <div className={`border p-4 rounded-2xl flex flex-col justify-between space-y-3 text-xs transition-all duration-300 ${
                    wubBlocked 
                      ? "border-rose-500/30 bg-[#13151D] bg-gradient-to-br from-[#13151D] to-rose-500/[0.04] shadow-[0_0_15px_rgba(244,63,94,0.06)]" 
                      : "border-[#1A1D28] bg-[#13151D]"
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl select-none shrink-0 border ${
                        wubBlocked 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                          : "bg-slate-800 text-slate-500 border-transparent"
                      }`}>
                        <Shield className={`w-5 h-5 shrink-0 ${wubBlocked ? "text-rose-500" : "text-slate-500"}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-white font-mono font-bold uppercase tracking-wide">
                          <span>Windows Update Blocker</span>
                          <span className={`text-[8px] px-1 rounded font-sans uppercase font-extrabold ${
                            wubBlocked ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                          }`}>
                            {wubBlocked ? "Updates Paused" : "Standard Active"}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-sans font-normal text-[11px]">
                          Disable standard auto-patching processes via registry overrides, pausing Microsoft deployment cycles, and disabling system diagnostic delivery services.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {wubProcessing ? "Enforcing system policies..." : `Update system: ${wubBlocked ? "DISABLED" : "ENABLED"}`}
                      </span>
                      <button
                        onClick={triggerWubBlock}
                        disabled={wubProcessing}
                        className={`px-3.5 py-1.5 rounded-xl font-bold transition duration-200 uppercase tracking-wider text-[10px] font-mono select-none cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                          wubBlocked
                            ? "bg-rose-550/15 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-455"
                            : "bg-[#7C5CFF]/10 hover:bg-[#7C5CFF] border border-[#7C5CFF]/25 hover:text-white text-[#7C5CFF]"
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        <span>{wubBlocked ? "Re-enable Updates" : "Block Win Updates"}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2 border-b border-[#1A1D28]/40 pb-3">
                  {["All", "Performance", "System", "Network", "Gaming", "Privacy"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                        categoryFilter === cat 
                          ? "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/30 font-semibold" 
                          : "text-slate-450 hover:text-white hover:bg-[#1A1D28]/40 border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <div className="ml-auto w-full sm:w-48 relative">
                    <input 
                      type="text" 
                      placeholder="Search active tweak..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 px-2.5 bg-[#13151D] border border-[#1A1D28] rounded-lg text-xs text-white focus:outline-none focus:border-[#7C5CFF]/60 placeholder:text-slate-600 font-mono"
                    />
                  </div>
                              {/* Grid - Adjusted to be 4 columns wide on desktop (xl:grid-cols-4) instead of 2 */}
                <div id="optimization-toggle-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredTweaks.map((t) => (
                    <div 
                      key={t.id} 
                      className={`group p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between h-[170px] ${
                        t.applied 
                          ? "border-[#7C5CFF]/40 bg-[#1A1D28]/80 shadow-[0_0_12px_rgba(124,92,255,0.12)]" 
                          : "border-white/5 bg-[#13151D]/60 hover:bg-[#1A1D28]/80 hover:border-[#7C5CFF]/25"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                            {t.category}
                          </span>
                          {t.recommended && (
                            <span className="text-[8px] bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 px-1 py-0.5 rounded font-mono font-bold select-none whitespace-nowrap">
                              CORES
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-white leading-tight group-hover:text-[#7C5CFF] transition duration-150 truncate" title={t.name}>{t.name}</h3>
                        <p className="text-[10px] text-slate-450 font-normal leading-normal line-clamp-3">
                          {t.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                        <span className="text-[9px] text-[#7C5CFF]/60 font-mono select-none uppercase tracking-wider">
                          Status: <span className={t.applied ? "text-emerald-400 font-bold" : "text-slate-500"}>{t.applied ? "Applied" : "Inactive"}</span>
                        </span>
                        
                        {/* Smooth & Consistent Toggle Button */}
                        <button 
                          onClick={() => handleToggleTweak(t.id)}
                          className="relative focus:outline-none transition-transform duration-150 active:scale-95 cursor-pointer select-none flex-shrink-0"
                          aria-label={`Toggle ${t.name}`}
                        >
                          <div className={`w-9 h-4.5 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                            t.applied 
                              ? "bg-[#7C5CFF] shadow-[0_0_10px_rgba(124,92,255,0.5)]" 
                              : "bg-[#252836] hover:bg-[#2e3142]"
                          }`}>
                            <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all duration-200 ${
                              t.applied ? "translate-x-4.5" : "translate-x-0"
                            }`}></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>    </div>
              </div>
            )}

            {/* Network Insights Tab */}
            {activeTab === "network" && (
              <div id="tab-network" className="space-y-4 animate-fade-in">
                <div className="border-b border-[#1A1D28] pb-3">
                  <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">TCP / IP High-Performance Network Interface</h2>
                  <p className="text-xs text-slate-400">Low-latency TCP/NIC buffer management details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Explanation card */}
                  <div className="p-4 bg-[#13151D] border border-[#1A1D28] rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_6px_rgba(124,92,255,0.6)]"></span>
                      <span>Latency Tweak Mechanisms</span>
                    </h3>
                    <div className="space-y-2.5 text-xs text-slate-300 leading-normal font-normal">
                      <div className="p-3 border border-white/5 bg-[#1A1D28]/40 rounded-xl">
                        <strong className="text-[#7C5CFF] block mb-0.5">TCP No Delay (Nagle's Algorithm)</strong>
                        <p className="text-[11px] text-slate-400">By default, Windows buffers network packet segments together before sending them to save bandwidth. Disabling this causes packets to be sent immediately.</p>
                      </div>
                      <div className="p-3 border border-white/5 bg-[#1A1D28]/40 rounded-xl">
                        <strong className="text-[#7C5CFF] block mb-0.5">TCP Ack Frequency (Immediate ACKs)</strong>
                        <p className="text-[11px] text-slate-400">Forces network interface nodes to immediately dispatch confirmation receipts (ACKs) for received segments instead of waiting 200ms, vital for high-tick gaming.</p>
                      </div>
                      <div className="p-3 border border-white/5 bg-[#1A1D28]/40 rounded-xl">
                        <strong className="text-[#7C5CFF] block mb-0.5">DNS Resolver Node Mapping</strong>
                        <p className="text-[11px] text-slate-400">Overwrites local ISP configurations with Cloudflare's ultra-secure server network (1.1.1.1), boosting host resolution by 200%+ on cold domain queries.</p>
                      </div>
                    </div>
                  </div>

                  {/* Flow comparison simulation card */}
                  <div className="p-4 bg-[#13151D] border border-[#1A1D28] rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_6px_rgba(124,92,255,0.6)]"></span>
                        <span>Interactive Latency Simulation Diagram</span>
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Compare standard buffered connection routing against SoftControl Optimized low-latency queues.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Scenario A: Standard */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Standard Windows OS Networking</span>
                          <span>RTT: ~68ms</span>
                        </div>
                        <div className="h-7 bg-[#090A0F] border border-[#1A1D28] rounded-xl flex items-center px-1 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-red-500/10 border-r border-red-500/20 w-[60%]"></div>
                          <span className="text-[9px] font-mono text-slate-450 relative z-10 px-2.5 flex items-center">
                            [Packet Grouping Buffer Blocked] - Waiting 200ms Queue Fill
                          </span>
                        </div>
                      </div>

                      {/* Scenario B: Optimized */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span className="text-[#7C5CFF] font-semibold">SoftControl Low-Latency Pipeline</span>
                          <span className="text-emerald-400 font-bold">RTT: ~14ms</span>
                        </div>
                        <div className="h-7 bg-[#090A0F] rounded-xl border border-[#7C5CFF]/30 flex items-center px-1 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-emerald-500/15 border-r border-emerald-500/20 w-[14%]"></div>
                          <span className="text-[9px] font-mono text-white relative z-10 px-2.5 flex items-center justify-between w-full">
                            <span>[ACK Send Triggered Immediately] - Nagle Core Bypassed</span>
                            <span className="text-emerald-400 text-[8px] animate-pulse">OPTIMAL</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1A1D28]/50 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-550">Active network adapter query code:</span>
                      <span className="text-[10px] font-mono text-[#7C5CFF] select-all bg-[#090A0F] border border-[#1A1D28] px-2 py-1 rounded-lg">
                        Set-NetTCPSetting -SettingName InternetCustom
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Monitor Tab */}
            {activeTab === "monitor" && (
              <div id="tab-monitor" className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-end border-b border-[#1A1D28] pb-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Dynamic System WMI Dispatcher Dashboard</h2>
                    <p className="text-xs text-slate-400">Real-time stats updating automatically every 1.5 seconds.</p>
                  </div>
                  {/* Temp toggle control simulation */}
                  <div className="flex items-center space-x-2 bg-[#1A1D28] border border-white/5 px-2.5 py-1 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-450 font-semibold">WMI Sensor State:</span>
                    <button 
                      onClick={() => {
                        setTemperatureAvailable(!temperatureAvailable);
                        onAddLog("ACTION", `[WMI] Toggle simulated hardware direct diagnostic sensors (State: ${!temperatureAvailable ? "Available" : "N/A"})`);
                      }}
                      className={`px-2 py-0.5 text-[9px] rounded font-mono transition duration-200 cursor-pointer ${temperatureAvailable ? "bg-[#7C5CFF] text-white" : "bg-slate-800 text-slate-400"}`}
                    >
                      {temperatureAvailable ? "ONLINE" : "OFF (N/A)"}
                    </button>
                  </div>
                </div>

                {/* Grid layout cards matching Elegant Dark headers row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* CPU Card */}
                  <div className="bg-[#1A1D28] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-28">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>CPU Usage</span>
                      <Cpu className="w-4 h-4 text-[#7C5CFF]" />
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold font-mono text-white select-all">{metrics.cpuUsage}%</span>
                      <span className="text-[10px] text-emerald-400 mb-1.5 font-mono">Normal</span>
                    </div>
                    <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7C5CFF] rounded-full transition-all duration-300" style={{ width: `${metrics.cpuUsage}%` }}></div>
                    </div>
                  </div>

                  {/* RAM Card */}
                  <div className="bg-[#1A1D28] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-28">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>RAM Committed</span>
                      <HardDrive className="w-4 h-4 text-[#7C5CFF]" />
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold font-mono text-white select-all">{metrics.ramUsage}<span className="text-xs text-slate-400 font-sans">GB</span></span>
                      <span className="text-[10px] text-slate-550 mb-1 font-mono">/ 16GB</span>
                    </div>
                    <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7C5CFF] rounded-full transition-all duration-300" style={{ width: `${(metrics.ramUsage / metrics.ramTotalGb) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Disk IO Card */}
                  <div className="bg-[#1A1D28] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-28">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Disk Throughput</span>
                      <Trash2 className="w-4 h-4 text-slate-500" />
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold font-mono text-white select-all">{(metrics.diskReadMb + metrics.diskWriteMb).toFixed(1)}<span className="text-xs text-slate-400 font-sans">MB/s</span></span>
                    </div>
                    <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (metrics.diskReadMb + metrics.diskWriteMb) * 5)}%` }}></div>
                    </div>
                  </div>

                  {/* Temp Dials */}
                  <div className="bg-[#1A1D28] p-4 rounded-xl border border-[#7C5CFF]/10 flex flex-col justify-between h-28">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>GPU Temp</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]"></span>
                    </span>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold font-mono select-all ${typeof metrics.gpuTemp === 'number' && metrics.gpuTemp > 75 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {metrics.gpuTemp}{typeof metrics.gpuTemp === 'number' ? "°C" : ""}
                      </span>
                      <span className="text-[10px] text-orange-450 mb-1.5 font-mono">Idle</span>
                    </div>
                    <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${typeof metrics.gpuTemp === 'number' ? metrics.gpuTemp : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Wave graph visualization */}
                <div className="p-4 bg-[#13151D] border border-[#1A1D28] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-300 tracking-wide font-bold">CPU Usage History wave (15-step)</span>
                    <span className="text-[10px] font-mono text-slate-550">Updating 1500ms intervals</span>
                  </div>
                  
                  {/* Dynamic SVG graph */}
                  <div className="h-20 w-full bg-[#090A0F] rounded-xl border border-[#1A1D28] overflow-hidden flex items-end">
                    <svg className="w-full h-full animate-pulse" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#7C5CFF"
                        strokeWidth="1.5"
                        points={cpuHistory.map((val, idx) => `${(idx / (cpuHistory.length - 1)) * 100},${20 - (val / 100) * 18}`).join(" ")}
                      />
                    </svg>
                  </div>
                </div>

                {/* Hardware Integrity & Memory Purge Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Column 1: Secure Hardware Integrity Status (TPM / Secure Boot / BitLocker) */}
                  <div className="bg-[#13151D] border border-[#1A1D28] p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase flex items-center justify-between">
                        <span>BIOS &amp; TPM Kernel Integrity Monitor</span>
                        <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">SYSTEM SECURE</span>
                      </h3>
                      <p className="text-[10px] text-slate-450 font-normal">Active query sensors reporting Windows security core hardware features.</p>
                    </div>

                    <div className="space-y-2.5">
                      {/* TPM Row */}
                      <div className="p-2.5 bg-[#1A1D28]/45 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Shield className="w-4 h-4 text-[#7C5CFF]" />
                          <div>
                            <span className="text-xs font-bold text-white block">TPM 2.0 Security Module</span>
                            <span className="text-[9px] text-slate-455 font-mono block">WMI Class: Win32_Tpm</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active (v2.0)</span>
                      </div>

                      {/* Secure Boot Row */}
                      <div className="p-2.5 bg-[#1A1D28]/45 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Cpu className="w-4 h-4 text-[#7C5CFF]" />
                          <div>
                            <span className="text-xs font-bold text-white block">UEFI Secure Boot Policy</span>
                            <span className="text-[9px] text-slate-455 font-mono block">State: UefiSecureBootEnabled</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
                      </div>

                      {/* BitLocker Row */}
                      <div className="p-2.5 bg-[#1A1D28]/45 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <FolderLock className="w-4 h-4 text-[#7C5CFF]" />
                          <div>
                            <span className="text-xs font-bold text-white block">BitLocker Volume Encryption</span>
                            <span className="text-[9px] text-slate-455 font-mono block">Drive Cipher: AES-256 Bit</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ENCRYPTED</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddLog("ACTION", "[SecInfo] Triggering live hardware register audit...");
                        onAddLog("INFO", "Executing command: Get-CimInstance -Namespace Root/Microsoft/Windows/DeviceGuard -ClassName Win32_DeviceGuard");
                        setTimeout(() => {
                          onAddLog("INFO", "[SecInfo] Core integrity: LSA Credential Guard, Virtualization-Based Security (VBS) verified completely safe.");
                          alert("All hardware security parameters verified: Secure Boot, TPM, & BitLocker are active!");
                        }, 500);
                      }}
                      className="w-full py-2 bg-[#1A1D28] hover:bg-[#252836] border border-white/5 hover:border-[#7C5CFF]/35 text-[11px] font-bold text-white uppercase rounded-xl transition cursor-pointer font-sans"
                    >
                      Audit Secure Boot Hardware Status
                    </button>
                  </div>

                  {/* Column 2: Working Set Standby Memory Purger */}
                  <div className="bg-[#13151D] border border-[#1A1D28] p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase flex items-center justify-between">
                        <span>Standby Cache Memory Optimizer</span>
                        <span className="text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-mono">STANDBY POOL</span>
                      </h3>
                      <p className="text-[10px] text-slate-450 font-normal">Purge standby system memory and free background caching tables instantly.</p>
                    </div>

                    <div className="p-4 bg-[#1A1D28]/45 border border-white/5 rounded-xl space-y-3 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-450">Active Memory:</span>
                        <span className="text-white font-bold">{metrics.ramUsage.toFixed(1)} GB</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-450">Standby Cache Memory:</span>
                        <span className="text-slate-300 font-bold">{isCleaningRam ? "Re-mapping..." : "4.12 GB"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-2">
                        <span className="text-slate-400 font-bold">Estimated Saving:</span>
                        <span className="text-emerald-450 font-extrabold font-mono">~ 3.20 GB</span>
                      </div>

                      <p className="text-[10px] text-slate-500 font-mono italic leading-normal text-center bg-[#090A0F]/60 p-2 rounded-lg border border-white/5 min-h-[44px] flex items-center justify-center">
                        {isCleaningRam ? ramStatusText : "System memory blocks are currently holding 4.12 GB of standby caching pools."}
                      </p>
                    </div>

                    <button
                      onClick={triggerRamClean}
                      disabled={isCleaningRam}
                      className="w-full py-2.5 bg-[#7C5CFF] hover:bg-[#6b47ff] disabled:opacity-40 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#7C5CFF]/10 flex items-center justify-center space-x-1.5 cursor-pointer font-sans"
                    >
                      {isCleaningRam ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white mr-1.5" /> : <HardDrive className="w-3.5 h-3.5 mr-1.5" />}
                      <span>{isCleaningRam ? "Purging Standby Lists..." : "Purge Standby Cache Poole (EmptyWorkingSet)"}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Smart Clean Tab */}
            {activeTab === "clean" && (
              <div id="tab-clean" className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1A1D28] pb-3 gap-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Smart Temp &amp; Browser Cache Decimator</h2>
                    <p className="text-xs text-slate-400">Scan volatility assets and wipe browser cookies/temp logs safely.</p>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button 
                      onClick={handleScanNow} 
                      disabled={isScanning || isCleaning}
                      className="px-4 py-2 bg-[#1A1D28] text-white hover:bg-[#252836] disabled:opacity-40 border border-white/5 text-xs font-bold rounded-xl transition flex items-center space-x-1 w-full sm:w-auto justify-center cursor-pointer font-sans"
                    >
                      {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1 text-[#7C5CFF]" /> : null}
                      <Search className="w-3.5 h-3.5 text-[#7C5CFF]" />
                      <span>Scan Sizes</span>
                    </button>
                    <button 
                      onClick={handleCleanNow} 
                      disabled={isScanning || isCleaning || !scannedSizes}
                      className="px-4 py-2 bg-gradient-to-r from-[#7C5CFF] to-[#6c4be0] disabled:opacity-40 text-white hover:opacity-90 active:scale-95 text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFF]/20 transition flex items-center space-x-1 w-full sm:w-auto justify-center cursor-pointer font-sans"
                    >
                      {isCleaning ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean Now</span>
                    </button>
                  </div>
                </div>

                {/* Scan list dashboard preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Directories sizes items */}
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-[#1A1D28]/40 pb-1">Volatile system targets list</span>
                    
                    {isScanning ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-300 border border-dashed border-[#1A1D28] rounded-xl bg-[#090A0F]/20 font-mono text-center p-4">
                        <RefreshCw className="w-7 h-7 mb-2 text-[#7C5CFF] animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7C5CFF] block mb-1">Evaluating System Cache Structures</span>
                        <p className="text-[10px] text-slate-400 italic max-w-xs leading-normal">&ldquo;{scanningStatusText}&rdquo;</p>
                      </div>
                    ) : !scannedSizes ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-500 border border-dashed border-[#1A1D28] rounded-xl bg-[#090A0F]/20">
                        <FolderLock className="w-7 h-7 mb-1 text-slate-600 animate-pulse" />
                        <p className="text-xs">No active scan has been processed. Await scan sizes click.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        {[
                          { key: "userTemp", label: "User Local Temps" },
                          { key: "winTemp", label: "Windows OS System Temp" },
                          { key: "winUpdate", label: "Update Cache System Distributions" },
                          { key: "prefetch", label: "Windows Prefetch Optimization Logs" },
                          { key: "thumbnails", label: "Global Windows Thumbnails Assets" },
                          { key: "edgeCache", label: "Microsoft Edge Explorer Cache" },
                          { key: "chromeCache", label: "Google Chrome profile storage" },
                          { key: "firefoxCache", label: "Mozilla Firefox Profiles Index" }
                        ].map(item => {
                          const record = scannedSizes[item.key];
                          const mValue = record.size;
                          return (
                            <div key={item.key} className="flex justify-between items-center text-xs border-b border-[#1A1D28]/40 pb-2 pt-1 font-mono">
                              <div className="space-y-0.5">
                                <span className="text-slate-300 font-semibold block">{item.label}</span>
                                <span className="text-[9px] text-slate-500 font-normal block truncate select-text w-56 md:w-36 lg:w-[220px]">
                                  {record.path}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {record.locked && (
                                  <span className="text-[8px] flex items-center space-x-0.5 px-1 py-0.2 bg-amber-500/10 text-amber-500 rounded border border-amber-500/10">
                                    <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                                    <span>LOCKED</span>
                                  </span>
                                )}
                                <span className={`font-bold ${mValue > 1000 ? "text-rose-455 font-semibold" : mValue > 0 ? "text-[#7C5CFF]/90 font-semibold" : "text-slate-600"}`}>
                                  {mValue.toFixed(1)} MB
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Clean operations console log terminal */}
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-[#1A1D28]/40 pb-1">Purification Shell output</span>
                      <div className="h-[120px] bg-[#090A0F] rounded-xl border border-[#1A1D28] p-3 font-mono text-[9px] text-slate-400 overflow-y-auto space-y-1.5 scrollbar-thin select-text">
                        {isCleaning ? (
                          <div className="flex items-center space-x-1.5 text-[#7C5CFF] animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Purging volatile active threads directory sectors...</span>
                          </div>
                        ) : cleanLogOutput.length === 0 ? (
                          <span className="text-slate-600 block">[Console Idle] Initialize "Clean Now" button to inspect progress...</span>
                        ) : null}
                        {cleanLogOutput.map((l, index) => (
                          <p key={index} className={l.includes("Warning:") ? "text-amber-500" : l.includes("Deleted") ? "text-emerald-400" : "text-slate-400"}>
                            {l}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono mt-3 text-right">
                      Skipped locking extensions processes safely inside C# Try-Catch blocks.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Log Cleanup Tab */}
            {activeTab === "privacy" && (
              <div id="tab-privacy" className="space-y-4 animate-fade-in text-slate-100">
                <div className="border-b border-[#1A1D28] pb-3">
                  <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Professional OS Privacy Maintenance Control</h2>
                  <p className="text-xs text-slate-400">Enforce deep security sweeps, flush tracking histories, customize package uninstalls, and run system rollbacks.</p>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Flush Utilities + Rollback + Bloatware */}
                  <div className="space-y-4">
                    {/* Event flush & DNS Cache */}
                    <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 border-b border-[#1A1D28]/40 pb-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]"></span>
                        <span>Diagnostic Flush Utilities</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                          onClick={handleCleanEvents}
                          className="p-3.5 bg-[#1A1D28]/30 hover:bg-[#1A1D28]/60 border border-[#1A1D28] rounded-xl text-left transition select-none cursor-pointer"
                        >
                          <span className="text-[#7C5CFF] font-mono font-bold text-xs block mb-1">Flush Event Logs</span>
                          <p className="text-[10px] text-slate-400 leading-normal font-normal">Runs PowerShell cmdlets to clean all operating Event Channels logs.</p>
                        </button>

                        <button 
                          onClick={handleFlushDns}
                          className="p-3.5 bg-[#1A1D28]/30 hover:bg-[#1A1D28]/60 border border-[#1A1D28] rounded-xl text-left transition select-none cursor-pointer"
                        >
                          <span className="text-[#7C5CFF] font-mono font-bold text-xs block mb-1">Purge DNS Cache</span>
                          <p className="text-[10px] text-slate-400 leading-normal font-normal">Standardizes IP resolution targets executing ipconfig/flushdns.</p>
                        </button>
                      </div>
                    </div>

                    {/* Core Rollback card - Now above Bloatware in Left Column */}
                    <div className="bg-[#13151D] border border-rose-500/15 hover:border-rose-500/25 bg-gradient-to-br from-[#13151D] to-rose-950/5 rounded-2xl p-4 flex flex-col justify-between transition">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-rose-455 font-bold">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <h3 className="text-xs font-bold uppercase font-mono tracking-wide">System Rollback Infrastructure (Undo All)</h3>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          SoftControl features a fully compliant architectural undo queue. Clicking rollback will safely restore all changed services, eliminate custom hosts mappings, return mouse acceleration algorithms, delete temporary variables modifications, and recover system registries to pristine default states.
                        </p>
                        <div className="p-2.5 border border-rose-950/30 bg-rose-950/10 rounded-xl font-mono text-[10px] text-rose-300">
                          * A system reboot is strongly recommended post executing rollback sequence to restore registry states safely.
                        </div>
                      </div>

                      <div className="mt-4">
                        <button 
                          onClick={() => setShowRollbackConfirm(true)}
                          className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:opacity-90 active:scale-[0.98] text-xs font-bold text-white uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span>Initialize System Reversal</span>
                        </button>
                      </div>
                    </div>

                    {/* Bloatware settings - Switched with USB Sanitizer to stay in Left Column */}
                    <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center justify-between border-b border-[#1A1D28]/40 pb-1.5">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>Customized Bloatware Eradicator</span>
                        </div>
                        <span className="text-[8px] px-1 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/10 font-bold uppercase tracking-wider">POWERSHELL APPX</span>
                      </h3>

                      <div className="p-3 border border-[#1A1D28] bg-[#090A0F]/55 rounded-xl text-[11px] text-slate-450 leading-relaxed space-y-1">
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span className="font-semibold uppercase tracking-wide text-[9px] font-mono font-bold">Selective Bloatware Eradication Block</span>
                        </div>
                        <p className="text-[10px]/normal text-slate-400">
                          Target unrequested AppxPackage registries. Mark the pre-installed Windows software clusters or telemetry packages below to unbind their runtime services.
                        </p>
                      </div>

                      {/* 19 specific checkable bloatware elements in a compact scroll area */}
                      <div className="space-y-1.5 max-h-[185px] overflow-y-auto pr-1.5 scrollbar-thin border border-[#1A1D28]/60 bg-[#090A0F]/30 p-2 rounded-xl">
                        {[
                          { key: "xbox", label: "Xbox Gaming Overlays", desc: "Removes XboxOverlay host and gaming bar streams" },
                          { key: "cortana", label: "Cortana Voice Assistant", desc: "De-lists Cortana system background voice assets" },
                          { key: "telemetry", label: "Diagnostic Telemetry", desc: "Stops performance telemetry feedback reporting services" },
                          { key: "widgets", label: "Taskbar Widgets & News Feeds", desc: "MSN Stocks, WebNews, and feed cache services" },
                          { key: "onedrive", label: "OneDrive Cloud System Sync", desc: "Removes local file tracking cloud backup background overlays" },
                          { key: "teams", label: "Microsoft Teams Chat Client", desc: "Autostart consumer workspace collaboration loops" },
                          { key: "yourPhone", label: "Phone Link Host App", desc: "Physical cellular integration runtime hooks" },
                          { key: "skype", label: "Skype Telephony System", desc: "Traditional voip background scheduler clients" },
                          { key: "maps", label: "Windows Offline Maps Store", desc: "Local positioning indexing and geolocation daemons" },
                          { key: "feedback", label: "Feedback Hub Collector", desc: "Obsolete feedback upload prompt services" },
                          { key: "bingSearch", label: "Bing Desktop Web Search", desc: "Blocks involuntary taskbar web resolution queries" },
                          { key: "games", label: "Casual Game Promos", desc: "Candy Crush, Solitaire Hub & partner assets" },
                          { key: "solitaire", label: "MS Solitaire Experience", desc: "Precompiled gaming overlays advertising" },
                          { key: "paint3d", label: "Paint 3D Creator Suite", desc: "Redundant three-dimensional graphic editors" },
                          { key: "mixedReality", label: "Mixed Reality Portal Setup", desc: "Orphaned spatial hardware drivers hooks" },
                          { key: "skypeVideo", label: "Skype MeetNow Widgets", desc: "Obsolete fast-call video conference modules" },
                          { key: "edge", label: "Edge Browser Backgrounders", desc: "Terminates passive Chromium boot optimizations" },
                          { key: "help", label: "Help & Support Agent Hooks", desc: "Aggressive system support redirection pages" },
                          { key: "zune", label: "Legacy Zune Music Player", desc: "Old-generation Windows Player packages" }
                        ].map(item => (
                          <label key={item.key} className="flex items-start space-x-2.5 p-2 bg-[#1A1D28]/15 border border-[#1A1D28]/35 rounded-lg hover:bg-[#1A1D28]/30 transition cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={(bloatwareOptions as any)[item.key]}
                              onChange={(e) => setBloatwareOptions(v => ({ ...v, [item.key]: e.target.checked }))}
                              className="w-3.5 h-3.5 rounded mt-0.5 accent-amber-500 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
                            />
                            <div className="leading-tight">
                              <span className="text-xs font-mono font-bold text-slate-200 block">{item.label}</span>
                              <span className="text-[9px] text-slate-500 font-mono block">{item.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      <button 
                        onClick={handleUninstallBloatware}
                        disabled={isUninstallingBloatware}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-amber-950/20 active:scale-[0.99] select-none"
                      >
                        {isUninstallingBloatware ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Rematriculating Bloatware...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Selected Bloatware</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: USB Settings + System Integrity Checker */}
                  <div className="space-y-4">
                    {/* USB Sanitization Options - Switched from Left Column */}
                    <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center justify-between border-b border-[#1A1D28]/40 pb-1.5">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span>USB History Sanitization Options</span>
                        </div>
                        <span className="text-[8px] px-1 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/10 font-bold uppercase tracking-wider">SELECTIVE SWEEP</span>
                      </h3>

                      <div className="p-3 border border-[#1A1D28] bg-[#090A0F]/55 rounded-xl text-[11px] text-slate-450 leading-relaxed space-y-1.5">
                        <div className="flex items-center space-x-1 text-cyan-400">
                          <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                          <span className="font-semibold uppercase tracking-wide text-[9px] font-mono font-bold">What does the USB history cleaner do?</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Every connected USB device stores metadata footprints. 
                          Sanitizing logs eliminates inert device caches, unregisters orphaned registry profiles, and prevents physical insertion tracking.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="flex items-center space-x-2.5 p-2 bg-[#1A1D28]/20 border border-[#1A1D28]/40 rounded-lg hover:bg-[#1A1D28]/40 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={usbOptions.setupapi}
                            onChange={(e) => setUsbOptions(v => ({ ...v, setupapi: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded accent-cyan-455 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block">Clean setupapi.dev.log records</span>
                            <span className="text-[9px] text-slate-500 font-mono">Clear physical device insertion streams and hardware installation reports</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-2.5 p-2 bg-[#1A1D28]/20 border border-[#1A1D28]/40 rounded-lg hover:bg-[#1A1D28]/40 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={usbOptions.registryKeys}
                            onChange={(e) => setUsbOptions(v => ({ ...v, registryKeys: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded accent-cyan-455 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block">Dormant HKLM USBSTOR Registry nodes</span>
                            <span className="text-[9px] text-slate-500 font-mono">Unbind disconnected product registers inside Enum hardware branches</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-2.5 p-2 bg-[#1A1D28]/20 border border-[#1A1D28]/40 rounded-lg hover:bg-[#1A1D28]/40 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={usbOptions.readyboost}
                            onChange={(e) => setUsbOptions(v => ({ ...v, readyboost: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded accent-cyan-455 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block">Clear ReadyBoost caching tables</span>
                            <span className="text-[9px] text-slate-500 font-mono">Deletes obsolete external speed indexes and partition mappings references</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-2.5 p-2 bg-[#1A1D28]/20 border border-[#1A1D28]/40 rounded-lg hover:bg-[#1A1D28]/40 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={usbOptions.hidRecords}
                            onChange={(e) => setUsbOptions(v => ({ ...v, hidRecords: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded accent-cyan-455 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block">Orphaned HID Controller logs</span>
                            <span className="text-[9px] text-slate-500 font-mono">Eliminates inactive mouse, keyboard, and gamepad registration descriptors</span>
                          </div>
                        </label>
                      </div>

                      <button 
                        onClick={handleCleanUsb}
                        disabled={isCleaningUsb}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-cyan-950/20 active:scale-[0.99] select-none"
                      >
                        {isCleaningUsb ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Purging USB Trails...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Execute USB Sanitization Sweep</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* NEW BRAND ELEMENT: System Integrity Checker SFC/DISM */}
                    <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center justify-between border-b border-[#1A1D28]/40 pb-1.5">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Windows Integrity Checker (SFC & DISM.exe)</span>
                        </div>
                        <span className="text-[8px] px-1 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/10 font-bold uppercase tracking-wider">KERNEL REPAIR</span>
                      </h3>

                      <p className="text-[10px]/normal text-slate-400">
                        Restores uncorrupted package manifests. Running `sfc /scannow` validates file hashes while `DISM` repairs damaged payload files online from official Microsoft update repositories.
                      </p>

                      {/* Display Progress if scanning or recently finalized */}
                      {isApplyingIntegrity || integrityProgress > 0 ? (
                        <div className="space-y-2 bg-[#090A0F]/60 border border-[#1A1D28]/80 p-3 rounded-xl">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-400 font-bold truncate pr-3">{integrityStatusText}</span>
                            <span className="text-emerald-400 font-extrabold">{integrityProgress}%</span>
                          </div>
                          
                          {/* Progress bar gauge */}
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-350" 
                              style={{ width: `${integrityProgress}%` }}
                            />
                          </div>

                          {/* Interactive mini diagnostic output console */}
                          <div className="bg-slate-950 p-2 rounded-lg border border-[#1A1D28]/60 font-mono text-[9px] text-slate-300 h-28 overflow-y-auto pr-1 scrollbar-thin space-y-1">
                            {integrityLogs.length === 0 ? (
                              <p className="text-slate-650 italic">Awaiting terminal pipe streams...</p>
                            ) : (
                              integrityLogs.map((log, index) => (
                                <p key={index} className="leading-tight shrink-0">
                                  <span className="text-emerald-400 font-semibold mr-1.5">&gt;&gt;</span>
                                  <span>{log}</span>
                                </p>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 py-8 border border-dashed border-[#1A1D28]/80 rounded-xl bg-[#090A0F]/20 text-center text-xs text-slate-550 font-mono">
                          Diagnosis offline. Execute diagnostic cycle below to verify WinSxS store directories.
                        </div>
                      )}

                      <button 
                        onClick={triggerIntegrityCheck}
                        disabled={isApplyingIntegrity}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-950/20 active:scale-[0.99] select-none"
                      >
                        {isApplyingIntegrity ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Conducting OS Repair...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Initialize System Integrity Repair</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>     </div>
              </div>
            )}

            {/* Processes tab content */}
            {activeTab === "processes" && (
              <div id="tab-processes" className="space-y-4 animate-fade-in text-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1A1D28] pb-4 gap-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Real-Time Core Thread Process Manager</h2>
                    <p className="text-xs text-slate-400">Scan active scheduled background processes, assign dispatcher classes, adjust affinity locks, and eject volatile tasks.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    {processesSubTab === "processes" ? (
                      <input 
                        type="text" 
                        placeholder="Search active process..." 
                        value={processSearchInput}
                        onChange={(e) => setProcessSearchInput(e.target.value)}
                        className="w-full h-8 pl-8 pr-2.5 bg-[#13151D] border border-[#1A1D28] rounded-lg text-xs text-white focus:outline-none focus:border-[#7C5CFF]/60 placeholder:text-slate-600 font-mono"
                      />
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Search scheduled task..." 
                        value={taskSearchInput}
                        onChange={(e) => setTaskSearchInput(e.target.value)}
                        className="w-full h-8 pl-8 pr-2.5 bg-[#13151D] border border-[#1A1D28] rounded-lg text-xs text-white focus:outline-none focus:border-[#7C5CFF]/60 placeholder:text-slate-600 font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Sub Tab Bar Selector */}
                <div className="flex items-center space-x-2 border-b border-[#1A1D28]/30 pb-1">
                  <button
                    onClick={() => setProcessesSubTab("processes")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer font-sans border flex items-center gap-1.5 ${
                      processesSubTab === "processes"
                        ? "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/35"
                        : "text-slate-450 hover:text-white hover:bg-[#1A1D28]/30 border-transparent"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Active Thread Processes</span>
                  </button>
                  <button
                    onClick={() => setProcessesSubTab("tasks")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer font-sans border flex items-center gap-1.5 ${
                      processesSubTab === "tasks"
                        ? "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/35"
                        : "text-slate-455 hover:text-white hover:bg-[#1A1D28]/30 border-transparent"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled Windows Tasks</span>
                  </button>
                </div>

                {processesSubTab === "processes" ? (
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-[#0d0f17] text-slate-400 border-b border-[#1A1D28] uppercase text-[9px] tracking-wider">
                            <th className="p-3.5">PID</th>
                            <th className="p-3.5">Filename</th>
                            <th className="p-3.5">Active CPU %</th>
                            <th className="p-3.5">RAM Memory</th>
                            <th className="p-3.5">Dispatcher Priority</th>
                            <th className="p-3.5">Scheduling Authorization</th>
                            <th className="p-3.5 text-right w-[100px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1D28]/40">
                          {processesList
                            .filter(p => !processSearchInput || p.name.toLowerCase().includes(processSearchInput.toLowerCase()))
                            .map(p => {
                              const activeCoresCount = p.affinity.filter(Boolean).length;
                              return (
                                <React.Fragment key={p.pid}>
                                  <tr className="hover:bg-[#1A1D28]/35 text-slate-300 transition-colors">
                                    <td className="p-3.5 text-slate-500 text-[10px]">{p.pid}</td>
                                    <td className="p-3.5 text-white font-semibold flex items-center space-x-1.5 pt-4">
                                      <span className={`w-1.5 h-1.5 rounded-full ${p.user === "SYSTEM" ? "bg-cyan-500" : "bg-[#7C5CFF]"}`} title={p.user} />
                                      <span>{p.name}</span>
                                    </td>
                                    <td className="p-3.5">
                                      <span className={`font-mono text-[11px] ${
                                        p.cpu > 10 ? "text-rose-455 font-bold" : p.cpu > 3 ? "text-amber-500" : "text-emerald-400"
                                      }`}>
                                        {p.cpu.toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-[11px]">{(p.ram).toFixed(1)} MB</td>
                                    <td className="p-3.5">
                                      {editingPriorityPid === p.pid ? (
                                        <select
                                          value={p.priority}
                                          onChange={(e) => {
                                            const nextPri = e.target.value as any;
                                            setProcessesList(curr => curr.map(item => item.pid === p.pid ? { ...item, priority: nextPri } : item));
                                            onAddLog("ACTION", `[Priority] Set thread scheduling class override for PID ${p.pid} (${p.name})...`);
                                            onAddLog("INFO", `Standard kernel dispatcher class reassigned to: ${nextPri} class parameters.`);
                                            setEditingPriorityPid(null);
                                          }}
                                          className="bg-[#1A1D28] border border-[#7C5CFF]/40 rounded px-1.5 py-0.5 text-[10px] text-white font-mono focus:outline-none cursor-pointer"
                                          autoFocus
                                          onBlur={() => setEditingPriorityPid(null)}
                                        >
                                          {["Low", "Normal", "Above Normal", "High", "Realtime"].map(pri => (
                                            <option key={pri} value={pri}>{pri}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <button
                                          onClick={() => setEditingPriorityPid(p.pid)}
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition duration-150 cursor-pointer ${
                                            p.priority === "Realtime" 
                                              ? "bg-rose-500/15 text-rose-455 border-rose-500/10" 
                                              : p.priority === "High" 
                                                ? "bg-amber-500/15 text-amber-500 border-amber-500/10" 
                                                : p.priority === "Low" 
                                                  ? "bg-slate-800 text-slate-400 border-transparent" 
                                                  : "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/10"
                                          }`}
                                          title="Click to override priority"
                                        >
                                          {p.priority}
                                        </button>
                                      )}
                                    </td>
                                    <td className="p-3.5">
                                      <button
                                        onClick={() => setSelectedProcessForAffinity(selectedProcessForAffinity === p.pid ? null : p.pid)}
                                        className={`px-2 py-0.5 rounded text-[10px] border transition duration-150 cursor-pointer ${
                                          selectedProcessForAffinity === p.pid
                                            ? "bg-[#7C5CFF] text-white border-transparent"
                                            : activeCoresCount < 8
                                              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/10"
                                              : "bg-slate-900 text-slate-400 border-[#1A1D28] hover:border-[#7C5CFF]/30"
                                        }`}
                                      >
                                        {activeCoresCount === 8 ? "All Cores authorized" : `${activeCoresCount}/8 Cores configured`}
                                      </button>
                                    </td>
                                    <td className="p-3.5 text-right font-sans">
                                      <button
                                        onClick={() => handleEndTask(p.pid, p.name)}
                                        className="px-2 py-1 bg-rose-950/20 text-rose-450 hover:bg-rose-600 hover:text-white border border-rose-500/10 rounded transition text-[10px] font-bold cursor-pointer"
                                      >
                                        End Task
                                      </button>
                                    </td>
                                  </tr>
  
                                  {/* Collapsible inline core authorization scheduling mask drawer */}
                                  {selectedProcessForAffinity === p.pid && (
                                    <tr className="bg-[#090A0F] border-b border-[#1A1D28]" key={`${p.pid}-affinity-row`}>
                                      <td colSpan={7} className="p-3.5 bg-[#0e1017] border-t border-[#1A1D28] text-left">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                                          <div>
                                            <h4 className="text-xs font-bold text-[#7C5CFF] uppercase mb-0.5 flex items-center gap-1.5">
                                              <Cpu className="w-3.5 h-3.5" />
                                              <span>Processor Affinity Mask Control</span>
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-sans">Map which logical CPU execution threads are authorized to process hardware contexts for {p.name}.</p>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            {p.affinity.map((coreEnabled, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => {
                                                  const nextAffinity = [...p.affinity];
                                                  nextAffinity[idx] = !nextAffinity[idx];
                                                  
                                                  // At least one core must be scheduled
                                                  if (!nextAffinity.includes(true)) {
                                                    alert("A process must operate on at least one logical thread core!");
                                                    return;
                                                  }
  
                                                  setProcessesList(curr => curr.map(item => item.pid === p.pid ? { ...item, affinity: nextAffinity } : item));
                                                  onAddLog("ACTION", `[Affinity] Remapped process ${p.name} (PID: ${p.pid}) scheduling affinity core authorizations mask...`);
                                                  onAddLog("INFO", `Updated AUTHORIZED cores: ${nextAffinity.map((v, i) => v ? `Core ${i}` : "").filter(Boolean).join(", ")}`);
                                                }}
                                                className={`px-2.5 py-1 text-[10px] rounded-lg border transition cursor-pointer ${
                                                  coreEnabled 
                                                    ? "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/45 font-bold" 
                                                    : "bg-slate-900 text-slate-500 border-transparent hover:border-slate-800"
                                                }`}
                                              >
                                                Core {idx}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-[#0d0f17] text-slate-400 border-b border-[#1A1D28] uppercase text-[9px] tracking-wider">
                            <th className="p-3.5">Task Name & Directory path</th>
                            <th className="p-3.5">Schedule Trigger</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Last Run State</th>
                            <th className="p-3.5 text-right w-[120px]">Authorization</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1D28]/40">
                          {scheduledTasksList
                            .filter(t => !taskSearchInput || t.name.toLowerCase().includes(taskSearchInput.toLowerCase()) || t.description.toLowerCase().includes(taskSearchInput.toLowerCase()))
                            .map(task => (
                              <tr key={task.id} className="hover:bg-[#1A1D28]/35 text-slate-300 transition-colors">
                                <td className="p-3.5 py-4 max-w-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${task.enabled ? "bg-emerald-450" : "bg-slate-600"}`} />
                                    <span className="text-white font-bold text-[11px] block">{task.name}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 block truncate mt-0.5" title={task.path}>{task.path}</span>
                                  <p className="text-[10px] text-slate-400 leading-normal mt-1 font-sans font-normal line-clamp-2">{task.description}</p>
                                </td>
                                
                                <td className="p-3.5">
                                  {editingTriggerTaskId === task.id ? (
                                    <div className="flex items-center space-x-1">
                                      <input 
                                        type="text"
                                        value={tempTriggerText}
                                        onChange={(e) => setTempTriggerText(e.target.value)}
                                        className="h-7 bg-[#090A0F] border border-[#7C5CFF]/50 text-white rounded px-2 text-[11px] focus:outline-none w-44 font-mono font-bold"
                                        autoFocus
                                      />
                                      <button 
                                        onClick={() => handleSaveScheduledTaskTrigger(task.id, tempTriggerText)}
                                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans text-[10px] font-bold cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => setEditingTriggerTaskId(null)}
                                        className="py-1 px-2.5 bg-[#1A1D28] border border-white/5 hover:bg-[#252836] text-slate-300 rounded font-sans text-[10px] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold text-slate-300">{task.trigger}</span>
                                      <button 
                                        onClick={() => {
                                          setEditingTriggerTaskId(task.id);
                                          setTempTriggerText(task.trigger);
                                        }}
                                        className="px-2 py-0.5 bg-[#1A1D28] border border-white/5 hover:border-[#7C5CFF]/35 text-[9px] text-[#7C5CFF] rounded font-bold cursor-pointer font-sans"
                                      >
                                        Reschedule
                                      </button>
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    task.enabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500 border border-transparent"
                                  }`}>
                                    {task.enabled ? "Active" : "Disabled"}
                                  </span>
                                </td>

                                <td className="p-3.5 text-[11px]">
                                  {task.lastRun}
                                </td>

                                <td className="p-3.5 text-right font-sans">
                                  <button
                                    onClick={() => handleToggleScheduledTask(task.id)}
                                    className={`px-3 py-1 font-bold rounded transition text-[10px] cursor-pointer shadow-sm ${
                                      task.enabled 
                                        ? "bg-rose-950/25 border border-rose-500/15 text-rose-450 hover:bg-rose-600 hover:text-white" 
                                        : "bg-[#7C5CFF]/10 border border-[#7C5CFF]/15 text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white"
                                    }`}
                                  >
                                    {task.enabled ? "Disable Task" : "Enable Task"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Startup Registry App Registry Tab */}
            {activeTab === "startup" && (
              <div id="tab-startup" className="space-y-4 animate-fade-in">
                <div className="border-b border-[#1A1D28] pb-3">
                  <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">WPF DataGrid: Startup Application Run Registry</h2>
                  <p className="text-xs text-slate-400">Block unauthorized back-running executables loading on Windows login phases.</p>
                </div>

                <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-[#0d0f17] text-slate-400 border-b border-[#1A1D28] uppercase text-[10px]">
                          <th className="p-3.5">Application Name</th>
                          <th className="p-3.5">Command Executable Target</th>
                          <th className="p-3.5">Registry Node Directory</th>
                          <th className="p-3.5 text-center">Load State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1D28]/40">
                        {startupApps.map(app => (
                          <tr key={app.id} className="hover:bg-[#1A1D28]/30 text-slate-300 transition-colors">
                            <td className="p-3.5 font-semibold text-white truncate max-w-[150px]">{app.name}</td>
                            <td className="p-3.5 text-slate-400 text-[11px] truncate max-w-[280px] select-text font-normal">{app.command}</td>
                            <td className="p-3.5 text-[#7C5CFF]/80 text-[10px] font-normal">{app.location}</td>
                            <td className="p-3.5 flex items-center justify-center">
                              {/* Elegant switch toggle inside table block */}
                              <button 
                                onClick={() => toggleStartupApp(app.id)}
                                className="relative focus:outline-none transition cursor-pointer select-none"
                                aria-label={`Toggle ${app.name}`}
                              >
                                <div className={`w-10 h-5 rounded-full p-0.5 transition duration-200 flex items-center ${app.enabled ? "bg-[#7C5CFF]/80 shadow-[0_0_8px_rgba(124,92,255,0.4)]" : "bg-[#252836]"}`}>
                                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all duration-200 ${app.enabled ? "translate-x-5" : "translate-x-0"}`}></div>
                                </div>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-950/40 border-t border-[#1A1D28] text-[10px] text-slate-550 font-mono text-center">
                    Disabling custom programs adds binary values to: \HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run
                  </div>
                </div>
              </div>
            )}

            {/* Tweak Profiles Tab */}
            {activeTab === "profiles" && (
              <div id="tab-profiles" className="space-y-4 animate-fade-in">
                <div className="border-b border-[#1A1D28] pb-3">
                  <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Profile Management Settings</h2>
                  <p className="text-xs text-slate-400">Deploy bundled tweak packages or save custom configuration arrays in local sandbox json files.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Presets Grid */}
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 border-b border-[#1A1D28]/40 pb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_6px_rgba(124,92,255,0.4)]"></span>
                      <span>Default System Presets</span>
                    </h3>

                    <div className="space-y-2">
                      {[
                        { name: "Competitive FPS", desc: "Activates all CPU, priority, gaming scheduler, low delay network, and mouse tweaks." },
                        { name: "Streaming", desc: "Enables core system priority, disables background telemetries, maintains stable hardware loads." },
                        { name: "Low Latency", desc: "Focuses deeply on interface internet card queue modifications for active high-tick packets dispatch." },
                        { name: "Balanced", desc: "Keeps standard system overlays, limits search background sweeps, balances privacy indices." },
                        { name: "Power Saver", desc: "Reverts all high frequency boosts, sets minimum thresholds, disables intensive core drives." }
                      ].map(prof => (
                        <div key={prof.name} className="p-3 bg-slate-950/40 border border-[#1A1D28] hover:border-[#1A1D28]/80 rounded-xl flex justify-between items-center transition">
                          <div className="space-y-0.5">
                            <span className="text-xs text-white font-semibold block">{prof.name}</span>
                            <span className="text-[10px] text-slate-400 leading-normal font-normal block pr-6">
                              {prof.desc}
                            </span>
                          </div>
                          <div>
                            <button 
                              onClick={() => applyProfile(prof.name)}
                              className="px-3 py-1 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/25 active:scale-95 text-[#7C5CFF] border border-[#7C5CFF]/20 hover:border-[#7C5CFF]/40 text-[10px] font-bold rounded-lg transition cursor-pointer select-none"
                            >
                              Load
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Profiles database */}
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 border-b border-[#1A1D28]/40 pb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]"></span>
                        <span>Manage Private Custom Profiles</span>
                      </h3>

                      {/* Save custom section */}
                      <div className="space-y-2 bg-[#090A0F]/65 p-3 rounded-xl border border-[#1A1D28]">
                        <label className="text-[10px] font-mono text-slate-400 block font-semibold leading-none mb-1">Backup Active Toggles Layout</label>
                        <div className="flex space-x-2">
                          <input 
                            type="text" 
                            placeholder="e.g., Valorant FPS, Minimal Office"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="bg-[#13151D] border border-[#1A1D28] text-xs px-3 py-1.5 flex-1 rounded-xl text-white focus:outline-none focus:border-[#7C5CFF]"
                          />
                          <button 
                            onClick={handleSaveCustomProfile}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-[#7C5CFF] to-[#6c4be0] text-white hover:opacity-95 rounded-xl font-bold text-xs flex items-center space-x-1 select-none shadow hover:shadow-lg active:scale-95 transition cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>

                      {/* Created custom list */}
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Custom Backup List (settings.json schema)</span>
                        {customProfiles.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#1A1D28] rounded-xl bg-[#090A0F]/20 font-mono">
                            No custom local configurations created. Choose active tweaks and write backup identifier.
                          </div>
                        ) : (
                          customProfiles.map(p => (
                            <div key={p.name} className="flex justify-between items-center bg-[#090A0F]/45 border border-[#1A1D28] p-2.5 rounded-xl text-xs">
                              <span className="font-mono text-white font-semibold truncate max-w-[120px]">{p.name}</span>
                              <div className="flex space-x-1.5">
                                <button 
                                  onClick={() => loadCustomProfile(p)}
                                  className="px-2.5 py-1 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 text-[#7C5CFF] text-[9px] border border-[#7C5CFF]/20 rounded-lg font-bold uppercase transition cursor-pointer"
                                >
                                  Apply
                                </button>
                                <button 
                                  onClick={() => deleteCustomProfile(p.name)}
                                  className="px-2.5 py-1 hover:bg-rose-500/10 text-rose-400 text-[9px] border border-rose-500/20 rounded-lg font-bold uppercase transition cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-500 font-mono text-right leading-none">
                      Backup configuration is directly written block-by-block inside data folder settings schema.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lag reaction Tester Tab */}
            {activeTab === "lag" && (
              <div id="tab-lag" className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#1A1D28] pb-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">High-Precision visual input Interrupt reaction Tester</h2>
                    <p className="text-xs text-slate-400">Calculate local visual rendering processing overhead standardizing precision performance milliseconds metrics.</p>
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        setLagTimes([185, 202, 194]);
                        onAddLog("ACTION", "[Lag Tester] Visual history database scores wiped from system log files.");
                      }}
                      className="text-[10px] text-slate-400 hover:text-white font-mono uppercase bg-[#1A1D28] px-2.5 py-1 rounded-lg border border-[#1A1D28] transition cursor-pointer select-none"
                    >
                      Reset scores
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Reaction Interactive Canvas Target */}
                  <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                    <div 
                      id="wpf-canvas-sensor"
                      onClick={handleLagClick}
                      className={`h-60 rounded-2xl border flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 relative overflow-hidden ${
                        lagState === "idle" 
                          ? "bg-[#1A1D28]/30 border-[#1A1D28] hover:bg-[#1A1D28]/50" 
                          : lagState === "waiting" 
                          ? "bg-[#090A0F] border-rose-900/60 animate-pulse text-rose-200" 
                          : lagState === "active" 
                          ? "bg-gradient-to-br from-[#7C5CFF] to-[#6c4be0] border-[#7C5CFF] text-white scale-[1.01] shadow-[0_0_20px_rgba(124,92,255,0.35)]" 
                          : "bg-[#090A0F] border-[#1A1D28] text-white animate-fade-in"
                      }`}
                    >
                      {/* SVG Radar effect overlay inside sensory panel */}
                      {lagState === "waiting" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none"></div>
                      )}

                      <span className="text-sm font-bold tracking-tight uppercase font-mono text-center px-4">
                        {lagState === "idle" && "Click anywhere to trigger timer resolution test"}
                        {lagState === "waiting" && "Wait... Press Trigger on VIBRANT purple flush color"}
                        {lagState === "active" && "INTERRUPT CLICK NOW!"}
                        {lagState === "result" && lagFeedback}
                      </span>
                      
                      <p className={`text-[10px] mt-2 font-mono opacity-80 uppercase tracking-widest text-center px-6 leading-relaxed ${
                        lagState === "active" ? "text-white" : "text-slate-400"
                      }`}>
                        {lagState === "idle" && "Evaluates mouse polling rates and refresh latency using microsecond-precision timestamps."}
                        {lagState === "waiting" && "Stiff focus on active stage... Pre-clicks yield execution fault logs."}
                        {lagState === "active" && "DISPATCH INPUT NOW!"}
                        {lagState === "result" && "Click stage canvas to start secondary Trial iteration."}
                      </p>
                    </div>

                    {lagState === "idle" && (
                      <button 
                        onClick={startLagTest}
                        className="w-full py-2.5 bg-gradient-to-r from-[#7C5CFF] to-[#6c4be0] hover:opacity-90 active:scale-[0.98] rounded-xl tracking-wider uppercase font-mono text-xs font-bold text-white shadow-lg shadow-[#7C5CFF]/15 cursor-pointer transition"
                      >
                        Start precision cycle
                      </button>
                    )}
                    {lagState === "result" && (
                      <button 
                        onClick={startLagTest}
                        className="w-full py-2.5 bg-gradient-to-r from-[#7C5CFF] to-[#6c4be0] hover:opacity-90 active:scale-[0.98] rounded-xl tracking-wider uppercase font-mono text-xs font-bold text-white shadow-lg shadow-[#7C5CFF]/15 cursor-pointer transition"
                      >
                        Launch next test trial
                      </button>
                    )}
                    {lagState === "waiting" && (
                      <div className="w-full py-2.5 bg-[#090A0F]/50 text-rose-455 font-mono text-xs text-center rounded-xl border border-rose-950/20 uppercase tracking-widest animate-pulse font-semibold">
                        Stopwatch Armed ... Awaiting event
                      </div>
                    )}
                    {lagState === "active" && (
                      <div className="w-full py-2.5 bg-[#7C5CFF]/15 text-[#7C5CFF] font-mono text-xs text-center rounded-xl border border-[#7C5CFF]/30 uppercase tracking-widest animate-pulse font-semibold">
                        INPUT ANCHOR HIT! CLICK CANVAS TARGET PRECISELY!
                      </div>
                    )}
                  </div>

                  {/* High Scores visual card list */}
                  <div className="bg-[#13151D] border border-[#1A1D28] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 border-b border-[#1A1D28]/40 pb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]"></span>
                        <span>Recent Trial Latency Index</span>
                      </h3>

                      <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
                        {lagTimes.length === 0 ? (
                          <div className="py-12 border border-dashed border-[#1A1D28] text-center font-mono text-xs text-slate-500 rounded-xl bg-[#090A0F]/20">
                            No recent latency marks recorded. Complete reaction.
                          </div>
                        ) : (
                          lagTimes.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-[#090A0F]/45 p-2.5 rounded-xl border border-[#1A1D28]/40 font-mono text-slate-300">
                              <span className="text-slate-500 font-semibold">Trial #{lagTimes.length - idx}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold ${t < 160 ? "text-emerald-400" : t < 220 ? "text-[#7C5CFF]" : "text-rose-400"}`}>
                                  {t} ms
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  {t < 160 ? "EXCELLENT" : t < 220 ? "GOOD" : "AVERAGE"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="p-3 border border-[#1A1D28] bg-[#090A0F]/40 rounded-xl font-mono text-[10px] text-slate-500 leading-normal">
                        Evaluates microsecond reaction using high precision system anchor ticks. 0.5ms resolution enabled.
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === "settings" && (
              <div id="tab-settings" className="space-y-4 animate-fade-in text-xs">
                <div className="flex justify-between items-center border-b border-[#1A1D28] pb-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">SoftControl Core System Settings Dashboard</h2>
                    <p className="text-xs text-slate-400">Configure visual themes, customize hotkeys, and look up Pro license registrations.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Column 1: Hotkey Manager Section */}
                  <div className="bg-[#13151D] border border-[#1A1D28] p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase flex items-center justify-between">
                        <span>Hotkey Trigger Configurations</span>
                        <span className="text-[9px] font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 px-1.5 py-0.5 rounded uppercase font-mono">HOTKEY MGR</span>
                      </h3>
                      <p className="text-[10px] text-[#7C5CFF] font-mono">Assign global hotkey combinations to instantly trigger performance tools.</p>
                    </div>

                    <div className="space-y-2 flex-1">
                      {hotkeys.map((h, idx) => (
                        <div key={idx} className="p-2.5 bg-[#090A0F]/45 border border-white/5 rounded-xl flex items-center justify-between font-mono">
                          <div>
                            <span className="text-xs font-bold text-white block font-sans">{h.action}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Active Trigger: {h.keyCombo}</span>
                          </div>
                          
                          <select
                            value={h.keyCombo}
                            onChange={(e) => {
                              const newCombo = e.target.value;
                              setHotkeys(prev => prev.map((item, idy) => idy === idx ? { ...item, keyCombo: newCombo } : item));
                              onAddLog("ACTION", `[Hotkey] Re-mapped "${h.action}" trigger to standard shortcut: [${newCombo}]`);
                            }}
                            className="bg-[#090A0F] border border-[#1A1D28] text-slate-300 font-mono text-[10px] rounded px-2 py-1 max-w-[130px] cursor-pointer"
                          >
                            <option value="Ctrl + Alt + R">Ctrl + Alt + R</option>
                            <option value="Ctrl + Shift + F">Ctrl + Shift + F</option>
                            <option value="Ctrl + Alt + U">Ctrl + Alt + U</option>
                            <option value="Ctrl + Shift + S">Ctrl + Shift + S</option>
                            <option value="Shift + Alt + A">Shift + Alt + A</option>
                            <option value="Ctrl + Alt + K">Ctrl + Alt + K</option>
                            <option value="Ctrl + Alt + M">Ctrl + Alt + M</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border border-dashed border-[#1A1D28] bg-[#090A0F]/20 rounded-xl leading-relaxed text-slate-500 text-[10px] font-mono">
                      Hotkey triggers are monitored globally in the background of active windows. Resolution time is under 1.4 microseconds.
                    </div>
                  </div>

                  {/* Column 2: Appearance Options (Minimum 6 known styles) */}
                  <div className="bg-[#13151D] border border-[#1A1D28] p-4 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-[#7C5CFF] uppercase flex items-center justify-between">
                        <span>Dynamic Appearance Layout Skins</span>
                        <span className="text-[9px] font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 px-1.5 py-0.5 rounded uppercase font-mono">THEME SKIN</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">Swap active shell colors, highlights, and board layouts instantly.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "slate", name: "Slate Obsidian", primary: "#7C5CFF", desc: "Solid charcoal gray with Electric Purple accents" },
                        { id: "cyberpunk", name: "Cyberpunk Grid", primary: "#EC4899", desc: "Immersive neon cyber matrix of pink and magenta" },
                        { id: "win98", name: "Win98 Nostalgia", primary: "#008080", desc: "The legendary solid gray retro workspace layout" },
                        { id: "matrix", name: "Terminal Matrix", primary: "#10B981", desc: "Deep monochromatic phosphor digital terminal green" },
                        { id: "carbon", name: "Carbon Stealth", primary: "#94A3B8", desc: "Extremely eye-safe grayscale slate for absolute comfort" },
                        { id: "gold", name: "Monarch Royal", primary: "#EAB308", desc: "Regal imperial gold highlights across dark navy panels" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setAppearanceTheme(t.id);
                            localStorage.setItem("softcontrol_appearance_theme", t.id);
                            onAddLog("ACTION", `[Theme] Switched layout skin preset configuration to: "${t.name}"`);
                          }}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between text-left h-20 transition duration-150 cursor-pointer ${
                            appearanceTheme === t.id
                              ? "bg-[#1A1D28] border-[#7C5CFF] shadow-sm shadow-[#7C5CFF]/10 text-white"
                              : "bg-[#1A1D28]/30 border-[#1A1D28] hover:bg-[#1A1D28]/50 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] font-bold truncate">{t.name}</span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }}></span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-snug truncate mt-1">{t.desc}</p>
                        </button>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between bg-[#090A0F]/30 p-2.5 rounded-xl border border-white/5 font-mono">
                      <span>Active Selection:</span>
                      <span className="font-bold text-white uppercase tracking-widest">{appearanceTheme} Theme Mode</span>
                    </div>
                  </div>

                </div>

                {/* SoftControl Pro License Expired Ticker warning */}
                <div className="bg-rose-950/10 border border-rose-500/15 bg-gradient-to-br from-[#13151D] to-rose-500/[0.03] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl select-none border border-rose-500/20 shrink-0 mt-1">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-rose-500 font-mono font-bold uppercase tracking-wider text-xs">
                        <span>SOFTCONTROL PRO SUBSCRIPTION EXPIRED</span>
                        <span className="text-[8px] bg-rose-500 text-white font-sans px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">ACTION REQUIRED</span>
                      </div>
                      <p className="text-slate-400 text-[11px] font-normal leading-relaxed">
                        Your SoftControl Pro evaluation subscription has expired. System scheduler filters and low-level registry lock engines list are operating in standard evaluation modes.
                      </p>
                      
                      {/* Fake Countdown Ticker */}
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">Evaluation scope remaining:</span>
                        <span className="text-[11px] text-rose-400 font-mono font-bold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/10 tracking-widest leading-none">
                          00d : 02h : 14m : {40 + Math.ceil(licenseTimeLeft % 20)}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowLicenseModal(true);
                      onAddLog("ACTION", "[Licensing] Querying Windows activation directory server...");
                    }}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 uppercase tracking-wider font-mono"
                  >
                    Renew SoftControl Pro List
                  </button>
                </div>

              </div>
            )}

          </main>
        </div>

        {/* Real-time Logger Terminal Drawer footer */}
        <footer id="wpf-logs-footer" className={`bg-[#12141C] border-t border-[#1A1D28] p-3 flex flex-col transition-all duration-300 ease-in-out ${logsMinimized ? "space-y-0" : "space-y-2"}`}>
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center space-x-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              <Terminal className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Real-time C# Local Diagnostic Logging Terminal Output</span>
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-[8px] font-mono text-slate-500 select-text">
                Target: ./data/logs/softcontrol_2026-06-14.log
              </span>
              <button 
                onClick={() => setLogsMinimized(!logsMinimized)}
                className="text-[8px] font-mono hover:text-[#7C5CFF]/90 uppercase tracking-wider bg-[#090A0F] px-2.5 py-1 rounded-lg border border-[#1A1D28] hover:border-[#7C5CFF]/30 transition duration-200 cursor-pointer select-none flex items-center space-x-1.5 text-slate-400 hover:bg-[#1A1D28]/30"
                aria-label={logsMinimized ? "Maximize Logs" : "Minimize Logs"}
              >
                {logsMinimized ? (
                  <>
                    <Maximize2 className="w-3 h-3 text-[#7C5CFF]" />
                    <span>Maximize Logs</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Minimize Logs</span>
                  </>
                )}
              </button>
              <button 
                onClick={onClearLogs} 
                className="text-[8px] font-mono text-[#7C5CFF] hover:bg-[#7C5CFF]/10 hover:text-white uppercase tracking-wider bg-[#090A0F] px-2.5 py-1 rounded-lg border border-[#1A1D28] transition cursor-pointer select-none"
              >
                Clear output logs
              </button>
            </div>
          </div>

          <div className={`transition-all duration-300 ease-in-out bg-[#090A0F] font-mono text-[9px] overflow-y-auto space-y-1.5 scrollbar-thin select-text ${
            logsMinimized 
              ? "h-0 py-0 border-0 opacity-0 pointer-events-none mt-0 overflow-hidden" 
              : "h-20 p-2.5 p-2.5 mt-1 rounded-xl border border-[#1A1D28]/80"
          }`}>
            {logs.map((log, index) => {
              const color = log.level === "ACTION" ? "text-[#7C5CFF]" : log.level === "ERR" ? "text-rose-400" : "text-slate-400 font-normal";
              return (
                <p key={index} className={`${color} leading-normal`}>
                  <span className="text-slate-600 inline-block mr-1.5">[{log.timestamp}]</span>
                  <span className="text-[#7C5CFF]/70 inline-block mr-1.5 font-bold">[{log.level}]</span>
                  <span>{log.message}</span>
                </p>
              );
            })}
          </div>
        </footer>

      </div>

      {/* Admin Safety Rollback Confirmation dialog modal */}
      {showRollbackConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 border-none outline-none">
          <div className="bg-[#13151D] border border-[#1A1D28] max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-start space-x-3.5 text-rose-550">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 text-rose-500" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm uppercase font-mono tracking-wider leading-none text-rose-500">Confirm System Rollback Phase</h3>
                <p className="text-xs text-slate-400 font-normal">Reverting tweaks rewrites 40+ system values and restarts background diagnostic tools.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              This action will reset mouse filters precision, unblock Microsoft's tracking collections services, delete low-latency NIC settings, and return standard configurations. This will safely restore default Windows defaults.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button 
                onClick={() => setShowRollbackConfirm(false)}
                className="px-3.5 py-2 bg-slate-950 border border-[#1A1D28] text-xs text-slate-300 rounded-xl font-medium transition cursor-pointer"
              >
                Cancel Action
              </button>
              <button 
                onClick={handleRollback}
                className="px-4 py-2 bg-rose-600 hover:opacity-95 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition flex items-center space-x-1 shadow-lg shadow-rose-950/20 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm reversal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Restore Point Confirmation Modal */}
      {showCreateRestoreConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 border-none outline-none">
          <div className="bg-[#13151D] border border-amber-500/10 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-up text-slate-100">
            <div className="flex items-start space-x-3.5 text-amber-500">
              <Shield className="w-8 h-8 flex-shrink-0 text-amber-500" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm uppercase font-mono tracking-wider leading-none text-amber-550">Confirm Restore Checkpoint</h3>
                <p className="text-xs text-slate-400 font-normal">Establish local system shadow-copy fallback safe-state.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              This action triggers a kernel security registry snapshots capture. It records service schedules, low-latency adapters tables, and system profiles to ensure 100% reversible configurations.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button 
                onClick={() => setShowCreateRestoreConfirm(false)}
                className="px-3.5 py-2 bg-[#1A1D28]/60 hover:bg-[#1A1D28] border border-[#1A1D28] text-xs text-slate-300 rounded-xl font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={executeRestorePointCreation}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-xs font-bold text-slate-950 uppercase tracking-wider rounded-xl transition flex items-center space-x-1 shadow-lg shadow-amber-950/20 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Checkpoint</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Restore Point Security Warning Modal */}
      {showRestoreWarningModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 border-none outline-none">
          <div className="bg-[#13151D] border border-amber-500/20 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-up text-slate-100">
            <div className="flex items-start space-x-3.5 text-amber-500">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 text-amber-500 animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm uppercase font-mono tracking-wider leading-none text-amber-550">Optimization Safety Check</h3>
                <p className="text-xs text-slate-400 font-normal">No local system restore checkpoint exists for this browser configuration session.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              You are about to modify core low-level operating system registers. 
              If the dispatcher triggers a mismatch, Microsoft kernel conflicts may arise. Establishing a restore point guarantees full configuration safety.
            </p>

            {/* Checkbox to never show again */}
            <label className="flex items-center space-x-2.5 p-2 bg-[#1A1D28]/30 border border-[#1A1D28]/50 rounded-lg hover:bg-[#1A1D28]/50 transition cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={neverShowRestoreWarning}
                onChange={(e) => {
                  setNeverShowRestoreWarning(e.target.checked);
                  if (e.target.checked) {
                    localStorage.setItem("softcontrol_never_show_restore_warning", "true");
                    onAddLog("INFO", "[Security] Lifetime suppression configuration toggled for optimization checkpoint backups.");
                  } else {
                    localStorage.removeItem("softcontrol_never_show_restore_warning");
                  }
                }}
                className="w-3.5 h-3.5 rounded accent-amber-500 bg-[#090A0F] border-[#1A1D28] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-mono font-medium">Never show this restore checkpoint warning again (Permanent lifetime policy)</span>
            </label>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowRestoreWarningModal(false);
                  
                  // Create restore point immediately
                  onAddLog("ACTION", "[SystemRestore] Initializing Windows System Restore snapshot core...");
                  onAddLog("INFO", "Executing command: Checkpoint-Computer -Description 'SoftControl Optimizations Core RestorePoint' -RestorePointType MODIFY_SETTINGS");
                  const nowStr = new Date().toLocaleString();
                  
                  setTimeout(() => {
                    onAddLog("INFO", `[SystemRestore] Created checkpoint 'SoftControl Optimizations Core RestorePoint' successfully at ${nowStr}`);
                    setHasRestorePoint(true);
                    setRestorePointTime(nowStr);
                    localStorage.setItem("softcontrol_has_restore_point", "true");
                    localStorage.setItem("softcontrol_restore_point_time", nowStr);
                    
                    // Run action after creating restore point
                    if (pendingOptimizeAction && pendingOptimizeAction.callback) {
                      pendingOptimizeAction.callback();
                    }
                    setPendingOptimizeAction(null);
                  }, 700);
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Create Checkpoint &amp; Proceed</span>
              </button>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setShowRestoreWarningModal(false);
                    if (pendingOptimizeAction && pendingOptimizeAction.callback) {
                      pendingOptimizeAction.callback();
                    }
                    setPendingOptimizeAction(null);
                  }}
                  className="w-1/2 py-2 bg-[#1A1D28]/60 hover:bg-[#1A1D28] border border-[#1A1D28] text-xs font-semibold text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Proceed Anyway
                </button>
                <button 
                  onClick={() => {
                    setShowRestoreWarningModal(false);
                    setPendingOptimizeAction(null);
                  }}
                  className="w-1/2 py-2 bg-[#090A0F] hover:bg-[#0d0f17] border border-white/5 text-xs font-semibold text-slate-500 rounded-xl transition cursor-pointer"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SoftControl Pro License Joke Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center center flex-col justify-center p-4 z-55 border-none outline-none">
          <div className="bg-[#13151D] border border-emerald-500/20 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="inline-flex p-3 bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 rounded-2xl select-none animate-bounce mt-1">
              <Check className="w-8 h-8 text-emerald-400 shrink-0" />
            </div>
            
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-emerald-400">Just kidding. It's free.</h3>
              <p className="text-xs text-slate-500 italic">Unlimited lifetime authorization granted.</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              SoftControl has been, currently is, and will forever be 100% free, bloatware-free, telemetry-free, and open source. Go enjoy your latency-optimized gaming sessions! No subscription strings attached. ❤️
            </p>

            <button 
              onClick={() => {
                setShowLicenseModal(false);
                onAddLog("INFO", "[Licensing] Standard enterprise dynamic pricing bypass activated. Lifetime PRO mode is active.");
              }}
              className="w-full py-2.5 bg-[#7C5CFF]/80 hover:bg-[#7C5CFF] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#7C5CFF]/10 cursor-pointer"
            >
              Get back to gaming
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
