import React, { useState, useEffect } from 'react';
import {
  X,
  FolderArchive,
  FileCode,
  Check,
  Copy,
  Eye,
  Play,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Rocket,
} from 'lucide-react';
import { ProjectFile, downloadProjectAsZip, buildRunnableHtml, launchInNewBrowserTab } from '../utils/zipGenerator';
import { useAppTheme } from '../context/ThemeContext';

interface ProjectZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  files: ProjectFile[];
  language?: 'roman-urdu' | 'urdu' | 'english';
  initialMode?: 'preview' | 'files';
}

export const ProjectZipModal: React.FC<ProjectZipModalProps> = ({
  isOpen,
  onClose,
  projectName,
  files,
  language = 'roman-urdu',
  initialMode = 'files',
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(initialMode === 'preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  // Compute runnable HTML document
  const combinedPreviewDoc = buildRunnableHtml(files);

  // Whenever modal opens or initialMode changes, set preview mode accordingly
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'preview' && combinedPreviewDoc) {
        setIsPreviewOpen(true);
      } else if (files.length > 0 && !combinedPreviewDoc) {
        setIsPreviewOpen(false);
      }
    }
  }, [isOpen, initialMode, combinedPreviewDoc, files.length]);

  if (!isOpen) return null;

  const currentFile = files[selectedFileIndex] || files[0];

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectAsZip(files, projectName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Could not package ZIP file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedFileIndex(index);
    setTimeout(() => setCopiedFileIndex(null), 2000);
  };

  const handleLaunchInGoogle = () => {
    if (!combinedPreviewDoc) return;
    launchInNewBrowserTab(combinedPreviewDoc, projectName || 'Muhammad 2000 AI App');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-5 backdrop-blur-md">
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 px-4 sm:px-6 py-3.5 bg-slate-900/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner shrink-0">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  {language === 'roman-urdu'
                    ? 'Project Deliverable & Direct Browser Launch'
                    : 'Project Deliverable & Live Browser Launch'}
                </h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                  {files.length} Files Ready
                </span>
                {combinedPreviewDoc && (
                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-medium text-indigo-300 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                    <span>Launch Ready</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'roman-urdu'
                  ? 'Aap direct Google / Browser mein live app chala sakte hain ya complete ZIP package download kar sakte hain.'
                  : 'Launch directly in Google / browser or download the complete production ZIP package.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Direct Launch in Google / Browser Button */}
            {combinedPreviewDoc && (
              <button
                id="btn-launch-google-tab"
                onClick={handleLaunchInGoogle}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 transition-all"
                title="Launch directly in a new Google Chrome / browser tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>
                  {language === 'roman-urdu' ? 'Launch in Google' : 'Open in Browser'}
                </span>
              </button>
            )}

            {/* Direct 1-Click ZIP Download Button */}
            <button
              id="modal-direct-zip-download-btn"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Packaging...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>ZIP Saved!</span>
                </>
              ) : (
                <>
                  <FolderArchive className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {language === 'roman-urdu' ? 'Download ZIP' : 'Download ZIP'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher & Responsive View Controls */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 px-4 sm:px-6 py-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors ${
                !isPreviewOpen
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-indigo-400" />
              <span>Project Files & Code ({files.length})</span>
            </button>

            {combinedPreviewDoc && (
              <button
                onClick={() => setIsPreviewOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors ${
                  isPreviewOpen
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                <span>Live Browser Sandbox</span>
              </button>
            )}
          </div>

          {isPreviewOpen && combinedPreviewDoc && (
            <div className="flex items-center gap-2">
              {/* Device Mode Toggles */}
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    deviceMode === 'desktop'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Desktop View (Full Width)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-1.5 rounded transition-colors ${
                    deviceMode === 'tablet'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    deviceMode === 'mobile'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Refresh Sandbox */}
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
                title="Reload Live App"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reload</span>
              </button>

              {/* Open in Google */}
              <button
                onClick={handleLaunchInGoogle}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors font-medium"
                title="Open in Google / New Tab"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Google Launch</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area: Split File Tree & File Viewer or Live Preview */}
        <div className="flex flex-1 overflow-hidden min-h-[440px] max-h-[calc(94vh-140px)]">
          {isPreviewOpen && combinedPreviewDoc ? (
            /* Live Web App Sandbox Preview */
            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
              <div
                className={`transition-all duration-300 h-full bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-800 ${
                  deviceMode === 'mobile'
                    ? 'w-[375px] max-w-full'
                    : deviceMode === 'tablet'
                    ? 'w-[768px] max-w-full'
                    : 'w-full'
                }`}
              >
                <iframe
                  key={previewKey}
                  title="Live Project Preview"
                  srcDoc={combinedPreviewDoc}
                  sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                  className="w-full h-full min-h-[460px] border-none bg-white"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: File Explorer List */}
              <div className="w-56 sm:w-64 border-r border-slate-800/80 bg-slate-950/60 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-800/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Project Files</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{files.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {files.map((file, idx) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                        selectedFileIndex === idx
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode
                          className={`h-3.5 w-3.5 shrink-0 ${
                            file.name.endsWith('.html')
                              ? 'text-orange-400'
                              : file.name.endsWith('.css')
                              ? 'text-sky-400'
                              : file.name.endsWith('.js') || file.name.endsWith('.ts')
                              ? 'text-yellow-400'
                              : file.name.endsWith('.json')
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{file.name}</span>
                      </div>
                      {file.size && (
                        <span className="text-[10px] text-slate-500 shrink-0">{file.size}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Code Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                {currentFile ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-200 font-medium">
                          {currentFile.name}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-mono text-slate-400">
                          {currentFile.language || 'text'}
                        </span>
                        {currentFile.size && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {currentFile.size}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopyCode(currentFile.content, selectedFileIndex)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        {copiedFileIndex === selectedFileIndex ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy File</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 selection:bg-indigo-500/30">
                      <code>{currentFile.content}</code>
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Select a file from the explorer to view contents.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
