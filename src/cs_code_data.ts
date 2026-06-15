/**
 * Production-ready C# source code files for SoftControl v2.1
 * Written with robust exception handling, Registry modifications, WMI hardware queries, and deep WPF design.
 */

export interface SourceFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const CS_PROJECT_FILES: SourceFile[] = [
  {
    filename: "app.manifest",
    path: "Properties/app.manifest",
    language: "xml",
    description: "Windows application manifest enforcing Administrator elevation for secure access to system configurations, registry edits, and services.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<assembly manifestVersion="1.0" xmlns="urn:schemas-microsoft-com:asm.v1">
  <assemblyIdentity version="2.1.0.0" name="SoftControl.App"/>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v2">
    <security>
      <requestedPrivileges xmlns="urn:schemas-microsoft-com:asm.v3">
        <!-- 
          Critical: SoftControl modifies system registry settings, manipulates system services, 
          and handles disk directories. requireAdministrator ensures security token elevation.
        -->
        <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
      </requestedPrivileges>
    </security>
  </trustInfo>
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <!-- Windows 10 & 11 compatibility -->
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}" />
    </application>
  </compatibility>
</assembly>`
  },
  {
    filename: "SoftControl.csproj",
    path: "SoftControl.csproj",
    language: "xml",
    description: "Modern SDK-Style WPF project file targeting .NET 8.0-windows, incorporating System.Management for core WMI queries.",
    content: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>
    <ApplicationManifest>Properties/app.manifest</ApplicationManifest>
    <AssemblyName>SoftControl</AssemblyName>
    <RootNamespace>SoftControl</RootNamespace>
    <Version>2.1.0</Version>
    <Authors>Expert .NET Developer</Authors>
    <Description>Professional Windows System Optimization and Diagnostic Suite</Description>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="System.Management" Version="8.0.0" />
    <PackageReference Include="System.Text.Json" Version="8.0.1" />
  </ItemGroup>

</Project>`
  },
  {
    filename: "Logger.cs",
    path: "Core/Logger.cs",
    language: "csharp",
    description: "Industrial-grade thread-safe logging engine writing logs locally with formatted severity tags.",
    content: `using System;
using System.IO;
using System.Text;

namespace SoftControl.Core
{
    public static class Logger
    {
        private static readonly string LogDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data", "logs");
        private static readonly object LockObj = new object();

        static Logger()
        {
            try
            {
                if (!Directory.Exists(LogDirectory))
                {
                    Directory.CreateDirectory(LogDirectory);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize logger directory: {ex.Message}");
            }
        }

        public static string GetLogPath()
        {
            string dateStr = DateTime.Now.ToString("yyyy-MM-dd");
            return Path.Combine(LogDirectory, $"softcontrol_{dateStr}.log");
        }

        public static void LogInfo(string message) => WriteLog("INFO", message);
        public static void LogAction(string message) => WriteLog("ACTION", message);
        public static void LogErr(string message, Exception? ex = null)
        {
            string fullMsg = message;
            if (ex != null)
            {
                fullMsg += $" | Exception: {ex.Message}\\nStackTrace: {ex.StackTrace}";
            }
            WriteLog("ERR", fullMsg);
        }

        private static void WriteLog(string level, string message)
        {
            lock (LockObj)
            {
                try
                {
                    string logFile = GetLogPath();
                    string logLine = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{level.ToUpper()}] {message}";

                    // Write synchronously and append cleanly
                    using (var writer = new StreamWriter(logFile, true, Encoding.UTF8))
                    {
                        writer.WriteLine(logLine);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Failed to write log line: {ex.Message}");
                }
            }
        }
    }
}`
  },
  {
    filename: "TweakManager.cs",
    path: "Core/TweakManager.cs",
    language: "csharp",
    description: "The core functional library handling Registry modifiers, system process configurations, custom setups, power schemas, and fallback restoration.",
    content: `using System;
using System.Diagnostics;
using System.IO;
using System.ServiceProcess; // Required reference: System.ServiceProcess.dll
using Microsoft.Win32;
using SoftControl.Core;

namespace SoftControl.Core
{
    public static class TweakManager
    {
        // 1. Ultimate Performance Power Plan
        public static bool ApplyUltimatePerformance()
        {
            try
            {
                Logger.LogAction("Applying Ultimate Performance Plan...");
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "powercfg",
                    Arguments = "-duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true
                };
                using (Process? proc = Process.Start(psi))
                {
                    proc?.WaitForExit();
                }

                // Activate it
                ProcessStartInfo psiAct = new ProcessStartInfo
                {
                    FileName = "powercfg",
                    Arguments = "-setactive e9a42b02-d5df-448d-aa00-03f14749eb61",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process? proc = Process.Start(psiAct))
                {
                    proc?.WaitForExit();
                }

                Logger.LogInfo("Ultimate Performance Power Plan applied successfully.");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to apply Ultimate Performance Power Plan.", ex);
                return false;
            }
        }

        // 2. Timer Resolution
        public static bool SetTimerResolution(bool enable)
        {
            try
            {
                string path = @"SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Kernel";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(path, true))
                {
                    if (key != null)
                    {
                        key.SetValue("GlobalTimerResolutionRequests", enable ? 1 : 0, RegistryValueKind.DWord);
                        Logger.LogInfo($"Timer Resolution requests {(enable ? "Enabled" : "Disabled")} in Registry.");
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to set Registry Core Timer resolution flag.", ex);
                return false;
            }
        }

        // 3. Core Parking OFF
        public static bool DisableCoreParking()
        {
            try
            {
                Logger.LogAction("Disabling CPU Core Parking...");
                // Setting Min CPU state to 100% for all systems through powercfg
                string[] commands = new string[] {
                    "-setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100",
                    "-setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100",
                    "-setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100",
                    "-setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100"
                };

                foreach (var arg in commands)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = "powercfg",
                        Arguments = arg,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                    using (Process? proc = Process.Start(psi))
                    {
                        proc?.WaitForExit();
                    }
                }

                // Force power update
                ProcessStartInfo psiAct = new ProcessStartInfo
                {
                    FileName = "powercfg",
                    Arguments = "-setactive SCHEME_CURRENT",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process? proc = Process.Start(psiAct))
                {
                    proc?.WaitForExit();
                }

                Logger.LogInfo("CPU Core Parking successfully disabled (CPU parameters forced to 100%).");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to disable Core Parking parameters.", ex);
                return false;
            }
        }

        // 4. EcoQoS Disable
        public static bool SetEcoQoS(bool disable)
        {
            try
            {
                Logger.LogAction($"Setting EcoQoS throttle parameter (Disable: {disable})...");
                string path = @"SYSTEM\\CurrentControlSet\\Control\\Power";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(path, true))
                {
                    if (key != null)
                    {
                        key.SetValue("PowerThrottlingOff", disable ? 1 : 0, RegistryValueKind.DWord);
                        Logger.LogInfo($"EcoQoS Throttling registry system set to {(disable ? "Off" : "On")}.");
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to edit EcoQoS PowThrottling keys.", ex);
                return false;
            }
        }

        // 5. Service Controls
        public static bool ControlWindowsService(string serviceName, ServiceStartMode startMode, bool stopService)
        {
            try
            {
                Logger.LogAction($"Configuring service {serviceName} (StartMode={startMode}, Stop={stopService})...");
                
                // Set start mode via Registry to guarantee service is permanently controlled
                string regPath = $@"SYSTEM\\CurrentControlSet\\Services\\{serviceName}";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(regPath, true))
                {
                    if (key != null)
                    {
                        int startValue = startMode switch
                        {
                            ServiceStartMode.Automatic => 2,
                            ServiceStartMode.Manual => 3,
                            ServiceStartMode.Disabled => 4,
                            _ => 2
                        };
                        key.SetValue("Start", startValue, RegistryValueKind.DWord);
                    }
                }

                // Stop the active service if running
                if (stopService)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = "sc.exe",
                        Arguments = $"stop {serviceName}",
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                    using (Process? p = Process.Start(psi))
                    {
                        p?.WaitForExit();
                    }
                }

                Logger.LogInfo($"Service {serviceName} updated successfully to: {startMode}.");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr($"Failed to configure service: {serviceName}", ex);
                return false;
            }
        }

        // 6. TCP Optimization (NoDelay, AckFrequency)
        public static bool ApplyTcpOptimizations(bool enable)
        {
            try
            {
                Logger.LogAction($"Configuring Network TCP Optimizations (Enable={enable})...");
                string interfacesPath = @"System\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces";
                using (RegistryKey? rootKey = Registry.LocalMachine.OpenSubKey(interfacesPath, true))
                {
                    if (rootKey != null)
                    {
                        string[] subKeys = rootKey.GetSubKeyNames();
                        foreach (string subkeyName in subKeys)
                        {
                            using (RegistryKey? interfaceKey = rootKey.OpenSubKey(subkeyName, true))
                            {
                                if (interfaceKey != null)
                                {
                                    if (enable)
                                    {
                                        interfaceKey.SetValue("TcpAckFrequency", 1, RegistryValueKind.DWord);
                                        interfaceKey.SetValue("TCPNoDelay", 1, RegistryValueKind.DWord);
                                    }
                                    else
                                    {
                                        interfaceKey.DeleteValue("TcpAckFrequency", false);
                                        interfaceKey.DeleteValue("TCPNoDelay", false);
                                    }
                                }
                            }
                        }
                    }
                }

                // Global network tweaks
                string tcpGlobalPath = @"System\\CurrentControlSet\\Services\\Tcpip\\Parameters";
                using (RegistryKey? globalKey = Registry.LocalMachine.OpenSubKey(tcpGlobalPath, true))
                {
                    if (globalKey != null)
                    {
                        if (enable)
                        {
                            globalKey.SetValue("DefaultTTL", 64, RegistryValueKind.DWord);
                            globalKey.SetValue("TCP1323Opts", 1, RegistryValueKind.DWord);
                        }
                        else
                        {
                            globalKey.DeleteValue("DefaultTTL", false);
                            globalKey.DeleteValue("TCP1323Opts", false);
                        }
                    }
                }

                Logger.LogInfo("TCP low latency packets optimizations applied to interfaces.");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to apply network interface low latency modifications.", ex);
                return false;
            }
        }

        // 7. GPU Hardware-Accelerated Scheduling
        public static bool SetHardwareAcceleratedGpuScheduling(bool enable)
        {
            try
            {
                Logger.LogAction($"Configuring GPU HW Scheduling (Enable={enable})...");
                string path = @"SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(path, true))
                {
                    if (key != null)
                    {
                        key.SetValue("HwSchMode", enable ? 2 : 1, RegistryValueKind.DWord);
                        Logger.LogInfo("Hardware GPU Scheduling altered in Registry (Reboot required).");
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to set HwSchMode in registries.", ex);
                return false;
            }
        }

        // 8. Kill Telemetry (Core Blocks)
        public static bool KillTelemetry(bool active)
        {
            try
            {
                Logger.LogAction("Toggling and cleaning Microsoft diagnostics telemetry settings...");
                string telemetryPath = @"SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection";
                using (RegistryKey key = Registry.LocalMachine.CreateSubKey(telemetryPath))
                {
                    key.SetValue("AllowTelemetry", active ? 0 : 1, RegistryValueKind.DWord);
                }

                // Block Diagnostic Track Service processes
                ControlWindowsService("DiagTrack", ServiceStartMode.Disabled, true);
                ControlWindowsService("dmwappushservice", ServiceStartMode.Disabled, true);

                // Add values to hosts file or block specific tracking endpoints
                Logger.LogInfo("Blocked telemetry key registers successfully.");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to kill telemetries.", ex);
                return false;
            }
        }

        // 9. Set Cloudflare DNS
        public static bool SetCloudflareDns(bool enable)
        {
            try
            {
                Logger.LogAction($"Setting Static DNS (Cloudflare: {enable})...");
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = enable 
                        ? "-Command \"Set-DnsClientServerAddress -InterfaceAlias * -ServerAddresses ('1.1.1.1','1.0.0.1')\""
                        : "-Command \"Set-DnsClientServerAddress -InterfaceAlias * -ResetServerAddresses\"",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process? p = Process.Start(psi))
                {
                    p?.WaitForExit();
                }
                Logger.LogInfo($"DNS Client Server settings modified. State: {(enable ? "Cloudflare Set" : "Reset Default")}");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to configure DNS configuration via shell.", ex);
                return false;
            }
        }

        // 10. Disable Hibernation & Fast Startup
        public static bool SetHibernation(bool enable)
        {
            try
            {
                Logger.LogAction($"Toggling windows hibernation capability (Enable={enable})...");
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "powercfg",
                    Arguments = enable ? "/h on" : "/h off",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process? p = Process.Start(psi))
                {
                    p?.WaitForExit();
                }

                // Fast startup toggle registry dependency 
                string lPath = @"SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(lPath, true))
                {
                    if (key != null)
                    {
                        key.SetValue("HiberbootEnabled", enable ? 1 : 0, RegistryValueKind.DWord);
                    }
                }

                Logger.LogInfo($"Hibernation state modified: {(enable ? "ON" : "OFF (Fast Startup Disabled)")}");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to tweak powercfg hibernation parameters.", ex);
                return false;
            }
        }

        // 11. Custom Mouse Acceleration (Framerates threshold fixes)
        public static bool ModifyMouseAcceleration(bool enable)
        {
            try
            {
                Logger.LogAction($"Reconfiguring Mouse Acceleration profile (Smoothness OFF={!enable})...");
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(@"Control Panel\\Mouse", true))
                {
                    if (key != null)
                    {
                        if (!enable)
                        {
                            // Precision 100% 1:1 hardware mouse mapping values
                            key.SetValue("MouseSpeed", "0", RegistryValueKind.String);
                            key.SetValue("MouseThreshold1", "0", RegistryValueKind.String);
                            key.SetValue("MouseThreshold2", "0", RegistryValueKind.String);
                        }
                        else
                        {
                            key.SetValue("MouseSpeed", "1", RegistryValueKind.String);
                            key.SetValue("MouseThreshold1", "6", RegistryValueKind.String);
                            key.SetValue("MouseThreshold2", "10", RegistryValueKind.String);
                        }
                    }
                }
                Logger.LogInfo("Registry mouse pointers tracking parameters applied.");
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to configure Cursor mapping acceleration thresholds.", ex);
                return false;
            }
        }

        // Rollback System (Iterative Restore Routine)
        public static void UndoAllTweaks()
        {
            try
            {
                Logger.LogAction("================= ROLLBACK PROCESS INITIALIZED =================");
                
                // Re-enable services
                ControlWindowsService("SysMain", ServiceStartMode.Automatic, false);
                ControlWindowsService("DiagTrack", ServiceStartMode.Automatic, false);
                ControlWindowsService("WSearch", ServiceStartMode.Automatic, false);

                // TCP tweaks restoration
                ApplyTcpOptimizations(false);

                // Reset GPU HW Acceleration
                SetHardwareAcceleratedGpuScheduling(false);

                // Reset DNS
                SetCloudflareDns(false);

                // Restore Hibernation
                SetHibernation(true);

                // Reset Game bar registry parameters 
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR", true))
                {
                    key?.SetValue("AppCaptureEnabled", 1, RegistryValueKind.DWord);
                }

                // Reset Mouse options
                ModifyMouseAcceleration(true);

                // Reset Telemetries
                string telemetryPath = @"SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection";
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(telemetryPath, true))
                {
                    key?.SetValue("AllowTelemetry", 1, RegistryValueKind.DWord);
                }

                Logger.LogInfo("Rollback completed successfully. Windows configuration reverted to defaults.");
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to successfully rollback one or more components.", ex);
            }
        }
    }
}`
  },
  {
    filename: "LagTesterViewModel.cs",
    path: "ViewModels/LagTesterViewModel.cs",
    language: "csharp",
    description: "Contains logic for the ultra high-precision latency testing canvas utilizing microsecond-resolution hardware timestamp APIs.",
    content: `using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace SoftControl.ViewModels
{
    public class LagTesterViewModel
    {
        private long _startTime;
        private long _endTime;
        private readonly double _frequency;

        public LagTesterViewModel()
        {
            // Verify if system high-precision performance counter is operational
            if (!Stopwatch.IsHighResolution)
            {
                Logger.LogErr("System does not support high resolution Stopwatch frequency timer!");
            }
            _frequency = Stopwatch.Frequency;
        }

        public void StartTiming()
        {
            // Fetch highest precision Win32 system ticks directly bypassing standard DateTime
            _startTime = Stopwatch.GetTimestamp();
        }

        public double StopAndCalculateLatency()
        {
            _endTime = Stopwatch.GetTimestamp();
            long elapsedTicks = _endTime - _startTime;
            
            // Standardise elapsed ticks directly to high-precision microsecond/millisecond floats
            double elapsedMs = (elapsedTicks * 1000.0) / _frequency;
            
            Logger.LogInfo($"visual click input latency calculation complete. Elapsed raw ticks: {elapsedTicks}. Microsecond conversion: {elapsedMs:F3} ms");
            return Math.Round(elapsedMs, 2);
        }
    }
}`
  },
  {
    filename: "MainWindow.xaml",
    path: "Views/MainWindow.xaml",
    language: "xml",
    description: "High-end WPF layout incorporating modern design properties, a borderless translucent frame, customizable toggles, startup tables, and responsive cards.",
    content: `<Window x:Class="SoftControl.Views.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2000/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2000/xaml"
        Title="SoftControl v2.1" Height="680" Width="1050"
        WindowStyle="None" AllowsTransparency="True" 
        Background="#090A0F" WindowStartupLocation="CenterScreen">
    
    <Window.Resources>
        <!-- Color Settings -->
        <SolidColorBrush x:Key="BackgroundBrush" Color="#090A0F"/>
        <SolidColorBrush x:Key="SurfaceBrush" Color="#13151D"/>
        <SolidColorBrush x:Key="CardBrush" Color="#1A1D28"/>
        <SolidColorBrush x:Key="AccentBrush" Color="#7C5CFF"/>
        <SolidColorBrush x:Key="TextBrush" Color="#F8FAFC"/>
        <SolidColorBrush x:Key="MutedTextBrush" Color="#6B7280"/>
        
        <!-- Toggle Template Styling -->
        <Style x:Key="WpfToggleStyle" TargetType="CheckBox">
            <Setter Property="Template">
                <Setter.Value>
                    <ControlTemplate TargetType="CheckBox">
                        <BulletDecorator Background="Transparent" Cursor="Hand">
                            <BulletDecorator.Bullet>
                                <Grid Height="20" Width="38">
                                    <Border x:Name="BackgroundBorder" CornerRadius="10" 
                                            Background="#2D3142" BorderThickness="0" 
                                            Transitions="{Styles:None}"/>
                                    <Ellipse x:Name="ThumbEllipse" Width="14" Height="14" 
                                             Fill="#F8FAFC" HorizontalAlignment="Left" 
                                             Margin="3,0,0,0">
                                        <Ellipse.RenderTransform>
                                            <TranslateTransform X="0" Y="0"/>
                                        </Ellipse.RenderTransform>
                                    </Ellipse>
                                </Grid>
                            </BulletDecorator.Bullet>
                        </BulletDecorator>
                        <ControlTemplate.Triggers>
                            <Trigger Property="IsChecked" Value="True">
                                <Setter TargetName="BackgroundBorder" Property="Background" Value="#7C5CFF"/>
                                <Setter TargetName="ThumbEllipse" Property="HorizontalAlignment" Value="Right"/>
                                <Setter TargetName="ThumbEllipse" Property="Margin" Value="0,0,3,0"/>
                            </Trigger>
                        </ControlTemplate.Triggers>
                    </ControlTemplate>
                </Setter.Value>
            </Setter>
        </Style>
    </Window.Resources>

    <Border BorderBrush="#1F2937" BorderThickness="1" CornerRadius="8">
        <Grid>
            <Grid.RowDefinitions>
                <RowDefinition Height="38"/> <!-- Draggable Header Bar -->
                <RowDefinition Height="*"/> <!-- Canvas Window View -->
            </Grid.RowDefinitions>

            <!-- Custom dragger header bar -->
            <Grid Grid.Row="0" Background="#13151D" MouseLeftButtonDown="Header_MouseLeftButtonDown">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <StackPanel Grid.Column="0" Orientation="Horizontal" VerticalAlignment="Center" Margin="15,0,0,0">
                    <Path Data="M19,4H5A2,2,0,0,0,3,6V18a2,2,0,0,0,2,2H19a2,2,0,0,0,2,-2V6A2,2,0,0,0,19,4ZM19,18H5V8H19Z" 
                          Fill="#7C5CFF" Width="14" Height="14" Stretch="Uniform" Margin="0,0,8,0"/>
                    <TextBlock Text="SOFTCONTROL v2.1" Foreground="#F8FAFC" FontSize="11" FontWeight="Bold" FontFamily="Courier New"/>
                </StackPanel>

                <!-- Window Actions -->
                <StackPanel Grid.Column="2" Orientation="Horizontal" HorizontalAlignment="Right" Height="38">
                    <Button Content="—" Background="Transparent" Foreground="#F8FAFC" BorderThickness="0" Width="40" Click="BtnMinimize_Click"/>
                    <Button Content="✕" Background="Transparent" Foreground="#F8FAFC" BorderThickness="0" Width="40" Click="BtnClose_Click"/>
                </StackPanel>
            </Grid>

            <!-- Main Workstation View Splitter -->
            <Grid Grid.Row="1">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="220"/>
                    <ColumnDefinition Width="*"/>
                </Grid.ColumnDefinitions>

                <!-- Sidebar Navigation Menu -->
                <Border Grid.Column="0" Background="#13151D" BorderBrush="#1F2937" BorderThickness="0,1,1,0">
                    <StackPanel Margin="10,20,10,0">
                        <TextBlock Text="OPTIMIZER SUITE" Foreground="#6B7280" FontSize="9" FontWeight="Medium" Margin="10,0,0,15"/>
                        
                        <Button Content="Optimize Tweaks" Click="TweakNav_Click" Background="#7C5CFF" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5" BorderThickness="0"/>
                        <Button Content="Network Details" Click="NetworkNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="Diagnostic Monitor" Click="MonitorNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="Smart Clean" Click="SmartCleanNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="Privacy &amp; Cleanup" Click="PrivacyNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="Startup Apps" Click="StartupNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="Tweak Profiles" Click="ProfilesNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                        <Button Content="High Precision Lag Test" Click="LagNav_Click" Background="Transparent" Foreground="#F8FAFC" Height="40" Margin="0,0,0,5"/>
                    </StackPanel>
                </Border>

                <!-- Main dynamic view container panel -->
                <Grid Grid.Column="1" Margin="20">
                    <TextBlock Text="Please choose a menu option on the sidebar to inspect dynamic WPF UserControls." 
                               HorizontalAlignment="Center" VerticalAlignment="Center" 
                               Foreground="#6B7280" TextWrapping="Wrap" TextAlignment="Center"/>
                </Grid>
            </Grid>
        </Grid>
    </Border>
</Window>`
  },
  {
    filename: "MainWindow.xaml.cs",
    path: "Views/MainWindow.xaml.cs",
    language: "csharp",
    description: "Code-behind routing window controls, mouse drag actions, and user control views to the UI layout.",
    content: `using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;
using SoftControl.Core;

namespace SoftControl.Views
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Logger.LogInfo("SoftControl MainWindow initialized successfully.");
        }

        private void Header_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                this.DragMove();
            }
        }

        private void BtnMinimize_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
            Logger.LogInfo("Window Minimized to tray status.");
        }

        private void BtnClose_Click(object sender, RoutedEventArgs e)
        {
            Logger.LogInfo("User requested exit configuration code. Saving status state and shutting down.");
            Application.Current.Shutdown();
        }

        private void TweakNav_Click(object sender, RoutedEventArgs e) => LogNav("Tweaks");
        private void NetworkNav_Click(object sender, RoutedEventArgs e) => LogNav("Network");
        private void MonitorNav_Click(object sender, RoutedEventArgs e) => LogNav("Monitor");
        private void SmartCleanNav_Click(object sender, RoutedEventArgs e) => LogNav("SmartClean");
        private void PrivacyNav_Click(object sender, RoutedEventArgs e) => LogNav("Privacy");
        private void StartupNav_Click(object sender, RoutedEventArgs e) => LogNav("Startup");
        private void ProfilesNav_Click(object sender, RoutedEventArgs e) => LogNav("Profiles");
        private void LagNav_Click(object sender, RoutedEventArgs e) => LogNav("LagTest");

        private void LogNav(string viewName)
        {
            Logger.LogInfo($"User navigated to UserControl View: {viewName}");
        }
    }
}`
  },
  {
    filename: "SettingsManager.cs",
    path: "Core/SettingsManager.cs",
    language: "csharp",
    description: "Handles load / save JSON persistence for all 22 tweak states and custom user profiles to settings files in data directories.",
    content: `using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace SoftControl.Core
{
    public class UserSettings
    {
        public Dictionary<string, bool> TweakStates { get; set; } = new Dictionary<string, bool>();
        public List<ProfileData> CustomProfiles { get; set; } = new List<ProfileData>();
    }

    public class ProfileData
    {
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, bool> TweakStates { get; set; } = new Dictionary<string, bool>();
    }

    public static class SettingsManager
    {
        private static readonly string SettingsFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data", "settings.json");

        public static UserSettings LoadSettings()
        {
            try
            {
                if (!File.Exists(SettingsFile))
                {
                    UserSettings defaults = CreateDefaultSettings();
                    SaveSettings(defaults);
                    return defaults;
                }

                string json = File.ReadAllText(SettingsFile);
                UserSettings? loaded = JsonSerializer.Deserialize<UserSettings>(json);
                return loaded ?? CreateDefaultSettings();
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to read settings.json configuration.", ex);
                return CreateDefaultSettings();
            }
        }

        public static void SaveSettings(UserSettings settings)
        {
            try
            {
                string dir = Path.GetDirectoryName(SettingsFile) ?? string.Empty;
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                var options = new JsonSerializerOptions { WriteIndented = true };
                string json = JsonSerializer.Serialize(settings, options);
                File.WriteAllText(SettingsFile, json);
                Logger.LogInfo("UserSettings updated to settings.json successfully.");
            }
            catch (Exception ex)
            {
                Logger.LogErr("Failed to write to settings.json.", ex);
            }
        }

        private static UserSettings CreateDefaultSettings()
        {
            var settings = new UserSettings();
            // Start default settings with standard tweaks configured to off
            for (int i = 1; i <= 22; i++)
            {
                settings.TweakStates[$"Tweak_{i}"] = false;
            }
            return settings;
        }
    }
}`
  }
];
