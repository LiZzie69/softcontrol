import React, { useState } from "react";
import { CS_PROJECT_FILES, SourceFile } from "../cs_code_data";
import { 
  FileText, 
  Search, 
  Copy, 
  Check, 
  Info, 
  Code,
  FolderOpen,
  Download,
  Terminal,
  FileCode,
  Compass
} from "lucide-react";

export default function CodeHub() {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(CS_PROJECT_FILES[2]); // Default to TweakManager
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchCodeQuery, setSearchCodeQuery] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = CS_PROJECT_FILES.filter(f => 
    f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple highlight renderer for code lines
  const renderHighlightedCode = (code: string, search: string) => {
    if (!search) return code;
    
    const parts = code.split(new RegExp(`(${escapeRegExp(search)})`, "gi"));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-400 text-black rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Auto-download helper for active file
  const handleDownloadFile = (file: SourceFile) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content], { type: "text/plain" });
    element.href = URL.createObjectURL(blob);
    element.download = file.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="code-hub-container" className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in font-sans text-sm pb-10">
      
      {/* File Explorer Directory pane */}
      <div id="file-explorer-sidebar" className="bg-[#13151D] border border-slate-900 rounded-xl p-4 space-y-4">
        <div className="space-y-1.5 pb-2 border-b border-slate-900/60">
          <h2 className="text-xs font-bold text-white uppercase font-mono flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-[#7C5CFF]" />
            <span>Visual Studio Solution</span>
          </h2>
          <p className="text-[11px] text-slate-400">SoftControl Project Directory</p>
        </div>

        {/* Directory-lookup search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search solution files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 px-2 pl-7 bg-[#090A0F] border border-slate-900 rounded text-xs text-white focus:outline-none focus:border-[#7C5CFF] font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        {/* File Tree List */}
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Properties folder virtual tree */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-2">Properties /</span>
            <div className="pl-3 space-y-0.5">
              {filteredFiles.filter(f => f.path.startsWith("Properties/")).map(f => (
                <button
                  key={f.filename}
                  onClick={() => { setSelectedFile(f); setCopied(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition font-mono text-[11px] flex items-center space-x-2 ${
                    selectedFile.filename === f.filename 
                      ? "bg-[#7C5CFF]/10 text-[#7C5CFF] font-semibold border-l-2 border-[#7C5CFF]" 
                      : "text-slate-300 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core folder virtual tree */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-2">Core / Tweaks</span>
            <div className="pl-3 space-y-0.5">
              {filteredFiles.filter(f => f.path.startsWith("Core/")).map(f => (
                <button
                  key={f.filename}
                  onClick={() => { setSelectedFile(f); setCopied(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition font-mono text-[11px] flex items-center space-x-2 ${
                    selectedFile.filename === f.filename 
                      ? "bg-[#7C5CFF]/10 text-[#7C5CFF] font-semibold border-l-2 border-[#7C5CFF]" 
                      : "text-slate-300 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <Code className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ViewModels folder virtual tree */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-2">ViewModels /</span>
            <div className="pl-3 space-y-0.5">
              {filteredFiles.filter(f => f.path.startsWith("ViewModels/")).map(f => (
                <button
                  key={f.filename}
                  onClick={() => { setSelectedFile(f); setCopied(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition font-mono text-[11px] flex items-center space-x-2 ${
                    selectedFile.filename === f.filename 
                      ? "bg-[#7C5CFF]/10 text-[#7C5CFF] font-semibold border-l-2 border-[#7C5CFF]" 
                      : "text-slate-300 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <Code className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Views folder virtual tree */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-2">Views / UI</span>
            <div className="pl-3 space-y-0.5">
              {filteredFiles.filter(f => f.path.startsWith("Views/")).map(f => (
                <button
                  key={f.filename}
                  onClick={() => { setSelectedFile(f); setCopied(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition font-mono text-[11px] flex items-center space-x-2 ${
                    selectedFile.filename === f.filename 
                      ? "bg-[#7C5CFF]/10 text-[#7C5CFF] font-semibold border-l-2 border-[#7C5CFF]" 
                      : "text-slate-300 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Project configuration root virtual tree */}
          <div className="space-y-1 border-t border-slate-900/40 pt-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-2">Project Config</span>
            <div className="pl-3 space-y-0.5 font-normal">
              {filteredFiles.filter(f => !f.path.includes("/")).map(f => (
                <button
                  key={f.filename}
                  onClick={() => { setSelectedFile(f); setCopied(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition font-mono text-[11px] flex items-center space-x-2 ${
                    selectedFile.filename === f.filename 
                      ? "bg-[#7C5CFF]/10 text-[#7C5CFF] font-semibold border-l-2 border-[#7C5CFF]" 
                      : "text-slate-300 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  <Info className="w-3.5 h-3.5 opacity-80" />
                  <span>{f.filename}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Code Editor and description layout */}
      <div id="code-viewer-panel" className="lg:col-span-3 flex flex-col space-y-4">
        
        {/* Active file metadata header */}
        <div className="p-4 bg-[#13151D] border border-slate-900 rounded-xl space-y-2 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 text-[9px] font-mono text-slate-400 rounded">
                SLN_PATH: {selectedFile.path}
              </span>
              <span className="px-2 py-0.5 bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/10 text-[9px] font-mono rounded">
                {selectedFile.language.toUpperCase()} FILE
              </span>
            </div>
            <h1 className="text-sm font-bold text-white uppercase font-mono">{selectedFile.filename}</h1>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">{selectedFile.description}</p>
          </div>

          {/* Top action row */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative mr-1.5 w-full sm:w-36">
              <input 
                type="text" 
                placeholder="Find in code..."
                value={searchCodeQuery}
                onChange={(e) => setSearchCodeQuery(e.target.value)}
                className="w-full h-8 px-2 bg-slate-900 border border-slate-950 rounded text-xs text-white focus:outline-none focus:border-[#7C5CFF] font-mono pr-5"
              />
              {searchCodeQuery && (
                <button className="absolute right-1.5 top-2 text-slate-500 hover:text-white" onClick={() => setSearchCodeQuery("")}>🗙</button>
              )}
            </div>

            <button 
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#7C5CFF] hover:bg-[#6a4ad6] text-white hover:shadow-lg hover:shadow-[#7C5CFF]/10 rounded select-none font-semibold text-xs transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Source"}</span>
            </button>
            
            <button 
              onClick={() => handleDownloadFile(selectedFile)}
              title="Download C# file"
              className="px-2.5 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 text-xs rounded transition flex items-center"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Source view core code block */}
        <div id="code-content-block" className="relative">
          <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            {selectedFile.content.split("\n").length} Lines / {new Blob([selectedFile.content]).size} Bytes
          </div>
          <div className="bg-[#090A0F] border border-slate-900/80 rounded-xl overflow-hidden shadow-inner font-mono text-xs max-h-[460px] overflow-y-auto p-4 scrollbar-thin select-text text-slate-300 whitespace-pre-wrap leading-relaxed">
            <code>
              {renderHighlightedCode(selectedFile.content, searchCodeQuery)}
            </code>
          </div>
        </div>

        {/* Quick Compiler/Setup Guide */}
        <div id="net-compilation-manual" className="p-4 bg-[#13151D] border border-slate-900 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-[#7C5CFF]" />
            <span>How to compile and deploy SoftControl v2.1 in Windows 10/11</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-normal text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <span className="text-[#7C5CFF] font-mono uppercase tracking-widest block font-bold text-[10px]">Method 1: Visual Studio Guide</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>Install Visual Studio 2022 and select the <strong className="text-slate-300 font-semibold">.NET Desktop Development Workload</strong>.</li>
                <li>Create a new <strong className="text-slate-300 font-semibold">WPF Application project</strong> named <code className="text-[#7C5CFF] font-bold">SoftControl</code> targeting <strong className="text-white">.NET 8.0</strong>.</li>
                <li>Copy the provided files into their respective directory structures relative to the project root.</li>
                <li>Replace default MainWindow source assets with the beautiful custom XAML/C# scripts.</li>
                <li>Build the solution using <strong className="text-slate-300 font-semibold">Build &gt; Build Solution</strong> (Ctrl+Shift+B).</li>
              </ol>
            </div>

            <div className="space-y-2">
              <span className="text-[#7C5CFF] font-mono uppercase tracking-widest block font-bold text-[10px]">Method 2: .NET 8 CLI Shell Compilation</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>Create a folder and setup. Run: <code className="text-slate-200 block bg-slate-950 font-normal px-2 py-0.5 rounded my-1">dotnet new wpf -n SoftControl</code></li>
                <li>Copy and paste all classes from this helper hub, modifying the directories structure.</li>
                <li>Add required assemblies packages on developer prompt: <code className="text-slate-200 block bg-slate-950 px-2 py-0.5 rounded font-normal my-1">dotnet add package System.Management</code></li>
                <li>Compile the optimal release payload using: <code className="text-slate-200 block bg-slate-950 px-2 py-0.5 rounded font-normal my-1">dotnet publish -c Release -r win-x64 --self-contained</code></li>
                <li>Double click the resulting elevated <code className="text-[#7C5CFF]">SoftControl.exe</code> file inside your publish directory!</li>
              </ol>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
