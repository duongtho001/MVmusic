
import React, { useState, useRef, useCallback, FC, useEffect } from 'react';
import { AudioPrompt, MusicPrompt, HistoryEntry } from './types';
import { GoogleGenAI } from "@google/genai";

// SVG Icons defined as separate components for reusability and clarity.

const SparklesIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const UploadIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const MusicIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
  </svg>
);

const PlayIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const CopyIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const PlusIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const HistoryIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SettingsIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const Spinner: FC<{ message?: string }> = ({ message = "Đang phân tích âm thanh..." }) => (
  <div className="flex flex-col items-center justify-center space-y-6">
    <svg width="80" height="60" viewBox="0 0 80 60" fill="currentColor" className="text-cyan-500">
      <rect x="0" y="30" width="10" height="30" >
        <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0s" dur="1s" repeatCount="indefinite" />
      </rect>
      <rect x="20" y="30" width="10" height="30" >
        <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.2s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.2s" dur="1s" repeatCount="indefinite" />
      </rect>
      <rect x="40" y="30" width="10" height="30" >
         <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.4s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.4s" dur="1s" repeatCount="indefinite" />
      </rect>
       <rect x="60" y="30" width="10" height="30" >
         <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.6s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.6s" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
    <p className="text-lg text-gray-500">{message}</p>
  </div>
);

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const dragOverStyle = isDragging ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300';

  return (
    <div
      className={`relative w-full max-w-lg p-8 border-2 border-dashed ${dragOverStyle} rounded-2xl transition-all duration-300 text-center flex flex-col items-center space-y-4 bg-white/50 backdrop-blur-sm shadow-sm`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg, audio/wav, audio/ogg, audio/flac, audio/mp4"
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />
      <UploadIcon className="w-16 h-16 text-gray-400" />
      <p className="text-gray-500">Kéo và thả tệp âm thanh của bạn vào đây</p>
      <p className="text-gray-400">hoặc</p>
      <button
        onClick={onButtonClick}
        disabled={isLoading}
        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
      >
        Chọn Tệp
      </button>
      <p className="text-xs text-gray-400 pt-2">Định dạng hỗ trợ: MP3, WAV, OGG, FLAC. Tối đa 50MB.</p>
    </div>
  );
};

interface PromptItemProps {
  prompt: AudioPrompt;
  isPlaying: boolean;
  isPlaybackEnabled: boolean;
  onPlay: () => void;
}

const PromptItem: FC<PromptItemProps> = ({ prompt, isPlaying, onPlay, isPlaybackEnabled }) => {
  return (
    <div className="flex items-center bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm hover:bg-gray-100/80 transition-colors space-x-4 border border-gray-200">
      <button
        onClick={onPlay}
        disabled={!isPlaybackEnabled}
        className="p-3 bg-gray-100 rounded-full hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 text-gray-700"
        aria-label={`Phát phân đoạn ${prompt.id + 1}`}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
       <div className="flex-grow items-center space-x-4">
        <div className="flex items-center gap-4">
          <MusicIcon className="w-6 h-6 text-cyan-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg text-gray-800">Phân đoạn {prompt.id + 1}</p>
            <p className="text-sm text-gray-500">
              {prompt.startTime.toFixed(2)}s - {prompt.endTime.toFixed(2)}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MusicPromptsDisplayProps {
    prompts: MusicPrompt[];
    onPromptTextChange: (promptIndex: number, newText: string) => void;
    onDownload: () => void;
}

const MusicPromptsDisplay: FC<MusicPromptsDisplayProps> = ({ prompts, onPromptTextChange, onDownload }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copyAllStatus, setCopyAllStatus] = useState(false);

    const handleCopy = (text: string, id: number) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    };
    
    const handleCopyAll = () => {
        const allPrompts = prompts.map(p => p.prompt).join('\n\n');
        navigator.clipboard.writeText(allPrompts).then(() => {
            setCopyAllStatus(true);
            setTimeout(() => setCopyAllStatus(false), 2000);
        });
    };

    return (
      <div className="space-y-6 mt-6 w-full text-left">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-2xl font-bold text-gray-800">Prompt Video đã tạo</h3>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-semibold transition-colors text-sm disabled:opacity-75"
                    disabled={copyAllStatus}
                >
                    <CopyIcon className="w-5 h-5" />
                    {copyAllStatus ? 'Đã sao chép!' : 'Sao chép tất cả'}
                </button>
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors text-sm shadow"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Tải xuống (.txt)
                </button>
            </div>
        </div>
        
        <div>
          <div className="space-y-4">
            {prompts.map((item, index) => (
              <div key={item.segment} className="bg-white/70 backdrop-blur-sm border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-1">
                    <p className="font-bold text-gray-800">Phân đoạn {item.segment}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(item.prompt, item.segment)}
                    className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-gray-500 flex items-center text-sm disabled: