import React, { useState } from "react";
import MainWindowWpf from "./components/MainWindowWpf";
import CodeHub from "./components/CodeHub";
import { LogLine } from "./types";
import { Terminal, Code, Cpu, Eye, Info, RefreshCw, Layers } from "lucide-react";

export default function App() {
  const [activeSegment, setActiveSegment] = useState<"workspace" | "code">("workspace");
  const [logs, setLogs] = useState<LogLine[]>(() => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return [
      { timestamp, level: "INFO", message: "SoftControl v2.1 Core Services booted into system thread." },
      { timestamp, level: "INFO", message: "Security Privilege validation complete. Run-level [requireAdministrator] confirmed." },
      { timestamp, level: "INFO", message: "Scanning local environment registry branches... Mapping 22 configuration keys." },
      { timestamp, level: "INFO", message: "WMI Host Adapter initialized. Microsecond resolution Stopwatch frequency validated." },
    ];
  });

  const handleAddLog = (level: "INFO" | "ACTION" | "ERR", message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogLine = { timestamp, level, message };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs of the current session
  };

  const handleClearLogs = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs([
      { timestamp, level: "INFO", message: "System diagnostic log stream truncated. Re-initializing terminal hooks." }
    ]);
  };

  return (
    <div id="application-deck-root" className="min-h-screen bg-[#07080e] text-[#F8FAFC] flex flex-col relative overflow-hidden">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-950/25 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-950/20 blur-[130px] pointer-events-none"></div>

      {/* Main Header Container bar */}
      <header id="deck-navigation-bar" className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-4 sm:pt-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-900 pb-3 sm:pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/30 px-3 py-1 text-xs font-mono font-bold tracking-widest rounded-full uppercase flex items-center space-x-1.5 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse"></span>
              <span>C# WPF Suite Companion</span>
            </div>
            <span className="text-xs font-mono text-slate-500">// v2.1.0-Release-Candidate</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono flex items-center space-x-2">
            <span>SOFTCONTROL v2.1</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-normal leading-relaxed">
            A Premium Windows 10/11 system acceleration and latency mitigation package. Experience the live interactive simulator or extract production-ready WPF source code files in one unified workspace.
          </p>
        </div>

        {/* Master Selector Frame tabs Toggle */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-900 rounded-lg p-1 self-start md:self-auto">
          <button 
            id="btn-nav-workspace"
            onClick={() => {
              setActiveSegment("workspace");
              handleAddLog("INFO", "Switched workspace viewport to WPF Interactive Simulator screen.");
            }}
            className={`px-3 py-2 text-xs rounded-md transition font-semibold flex items-center space-x-1.5 cursor-pointer ${
              activeSegment === "workspace" 
                ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/20" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </button>
          
          <button 
            id="btn-nav-code"
            onClick={() => {
              setActiveSegment("code");
              handleAddLog("INFO", "Switched workspace viewport to Visual Studio Source Code Explorer.");
            }}
            className={`px-3 py-2 text-xs rounded-md transition font-semibold flex items-center space-x-1.5 cursor-pointer ${
              activeSegment === "code" 
                ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/20" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>C# Code Hub</span>
          </button>
        </div>
      </header>

      {/* Main Dynamic Workspace Frame */}
      <main id="deck-workspace-viewport" className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:py-6">
        
        {/* Visualizer Frame switch */}
        {activeSegment === "workspace" ? (
          <div className="space-y-4">
            {/* Short introduction helper banner */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 sm:p-4 text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
              <div className="flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-[#7C5CFF] flex-shrink-0 mt-0.5" />
                <span className="font-normal leading-normal">
                  <strong className="text-white">Simulator Overview:</strong> Below is a high-fidelity visual and reactive emulation of <strong className="text-[#7C5CFF]">SoftControl's C# WPF desktop GUI</strong> inside Windows 11. Experience how the C# algorithms operate, toggle variables, run cleaning scans, test your reaction speeds, and inspect operational output logs.
                </span>
              </div>
              <div className="flex-shrink-0">
                <button 
                  onClick={() => {
                    setActiveSegment("code");
                    handleAddLog("INFO", "Navigated to C# code files explorer.");
                  }}
                  className="px-2.5 py-1 text-[11px] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/20 hover:border-[#7C5CFF] rounded transition font-bold"
                >
                  View C# Code
                </button>
              </div>
            </div>

            {/* Simulated Desktop WPF Application */}
            <MainWindowWpf 
              onAddLog={handleAddLog} 
              logs={logs} 
              onClearLogs={handleClearLogs} 
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Short introduction code helper banner */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 sm:p-4 text-xs font-mono text-slate-300 flex items-start space-x-2.5 shadow-inner">
              <Info className="w-4 h-4 text-[#7C5CFF] flex-shrink-0 mt-0.5" />
              <span className="font-normal leading-normal">
                <strong className="text-white">Developer's Workbook:</strong> Explore and copy the complete, production-ready source files backing <strong className="text-[#7C5CFF]">SoftControl v2.1</strong>. All blocks are fully implemented with real Microsoft Registry structures, thread-safe asynchronous disk streams, and precision stopwatch clock cycle queries.
              </span>
            </div>

            {/* Developer Project Explorer */}
            <CodeHub />
          </div>
        )}

      </main>

      {/* Page Footer */}
      <footer id="deck-global-footer" className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 border-t border-slate-900/60 text-slate-500 font-mono text-[10px] sm:text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left mt-auto">
        <div className="space-y-0.5">
          <p>© 2026 SoftControl Series // Created under .NET Framework and WPF Standards.</p>
          <p className="text-[10px] text-slate-600">Enterprise grade desktop utilities and high-performance indicators.</p>
        </div>
        <div className="flex items-center justify-center space-x-3.5 select-text">
          <span>Target Architecture: <strong className="text-slate-400 font-semibold">[Win x64 / .NET 8.0]</strong></span>
          <span>Security Status: <strong className="text-emerald-400 font-bold">100% SECURE</strong></span>
        </div>
      </footer>

    </div>
  );
}
