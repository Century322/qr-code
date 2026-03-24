import { useState, useEffect, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentVersion = '1.0.0';

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      const response = await fetch('https://api.github.com/repos/Century322/qr-code/releases/latest');
      
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

  const downloadUpdate = useCallback(async () => {
    if (!updateInfo?.downloadUrl) return;
    
    setDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        const response = await fetch(updateInfo.downloadUrl);
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应');
        
        const chunks: Uint8Array[] = [];
        let received = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          received += value.length;
          
          if (total > 0) {
            setDownloadProgress(Math.round((received / total) * 100));
          }
        }
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedArray = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combinedArray.set(chunk, offset);
          offset += chunk.length;
        }
        
        const blob = new Blob([combinedArray]);
        const base64 = await blobToBase64(blob);
        
        const fileName = `qr-code-v${updateInfo.latestVersion}.apk`;
        
        await Filesystem.writeFile({
          path: `Download/${fileName}`,
          data: base64.split(',')[1],
          directory: Directory.ExternalStorage,
        });
        
        setDownloadProgress(100);
        
        const fileUri = await Filesystem.getUri({
          path: `Download/${fileName}`,
          directory: Directory.ExternalStorage,
        });
        
        window.open(fileUri.uri, '_system');
        
      } else {
        window.open(updateInfo.downloadUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '下载失败');
    } finally {
      setDownloading(false);
    }
  }, [updateInfo]);

  return {
    updateInfo,
    checking,
    downloading,
    downloadProgress,
    error,
    checkForUpdate,
    downloadUpdate,
    currentVersion
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface UpdateModalProps {
  isDarkMode: boolean;
}

export function UpdateModal({ isDarkMode }: UpdateModalProps) {
  const { updateInfo, checking, downloading, downloadProgress, checkForUpdate, downloadUpdate } = useAppUpdate();
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

          {downloading && (
            <div className="mb-4">
              <div className={cn(
                "h-2 rounded-full overflow-hidden",
                isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]"
              )}>
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className={cn("text-xs text-center mt-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>
                下载中... {downloadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              disabled={downloading}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50",
                isDarkMode ? "bg-[#3a3a3c] text-slate-300" : "bg-[#E5E5EA] text-[#3C3C43]"
              )}
            >
              稍后提醒
            </button>
            <button
              onClick={handleUpdate}
              disabled={downloading}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-indigo-500 text-white shadow-md shadow-indigo-500/30 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {downloading ? '下载中...' : '立即更新'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
