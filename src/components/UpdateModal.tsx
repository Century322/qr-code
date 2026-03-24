import { useState, useEffect, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVersion = '1.0.0';

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      const response = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/releases/latest');
      
      if (!response.ok) {
        throw new Error('无法检查更新');
      }

      const release = await response.json();
      const latestVersion = release.tag_name.replace('v', '');
      
      const compareVersions = (current: string, latest: string) => {
        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);
        
        for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
          const currentPart = currentParts[i] || 0;
          const latestPart = latestParts[i] || 0;
          
          if (latestPart > currentPart) return true;
          if (latestPart < currentPart) return false;
        }
        
        return false;
      };

      const hasUpdate = compareVersions(currentVersion, latestVersion);

      setUpdateInfo({
        hasUpdate,
        latestVersion,
        currentVersion,
        downloadUrl: release.assets[0]?.browser_download_url || release.html_url,
        releaseNotes: release.body || '暂无更新说明'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查更新失败');
    } finally {
      setChecking(false);
    }
  }, []);

  const downloadUpdate = useCallback(() => {
    if (updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank');
    }
  }, [updateInfo]);

  return {
    updateInfo,
    checking,
    error,
    checkForUpdate,
    downloadUpdate,
    currentVersion
  };
}

interface UpdateModalProps {
  isDarkMode: boolean;
}

export function UpdateModal({ isDarkMode }: UpdateModalProps) {
  const { updateInfo, checking, checkForUpdate, downloadUpdate } = useAppUpdate();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  useEffect(() => {
    if (updateInfo?.hasUpdate && !dismissed) {
      setShowModal(true);
    }
  }, [updateInfo, dismissed]);

  const handleDismiss = () => {
    setShowModal(false);
    setDismissed(true);
  };

  const handleUpdate = () => {
    downloadUpdate();
    setShowModal(false);
  };

  if (!showModal || !updateInfo) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[10000] transition-opacity duration-300"
        style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }}
        onClick={handleDismiss}
      />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6">
        <div 
          className={cn(
            "w-full max-w-sm rounded-3xl shadow-2xl p-6",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
              isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
            )}>
              <svg className={cn("w-8 h-8", isDarkMode ? "text-indigo-400" : "text-indigo-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className={cn("text-lg font-semibold mb-1", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>
              发现新版本
            </h3>
            <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>
              v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
            </p>
          </div>

          <div className={cn(
            "rounded-xl p-3 mb-4 max-h-32 overflow-y-auto",
            isDarkMode ? "bg-[#3a3a3c]" : "bg-[#F2F2F7]"
          )}>
            <p className={cn("text-xs whitespace-pre-wrap", isDarkMode ? "text-slate-300" : "text-[#3C3C43]")}>
              {updateInfo.releaseNotes}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95",
                isDarkMode ? "bg-[#3a3a3c] text-slate-300" : "bg-[#E5E5EA] text-[#3C3C43]"
              )}
            >
              稍后提醒
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-indigo-500 text-white shadow-md shadow-indigo-500/30 transition-all duration-200 active:scale-95"
            >
              立即更新
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
