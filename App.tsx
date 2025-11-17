
import React, { useState, useRef, useCallback, FC, useEffect } from 'react';
import { AudioPrompt, MusicPrompt, HistoryEntry } from './types';
import { GoogleGenAI } from "@google/genai";

// SVG Icons defined as separate components for reusability and clarity.

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
                    className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-gray-500 flex items-center text-sm disabled:opacity-50 flex-shrink-0"
                    disabled={copiedId === item.segment}
                    aria-label={`Sao chép prompt cho phân đoạn ${item.segment}`}
                  >
                    {copiedId === item.segment ? 'Đã chép!' : <CopyIcon className="w-5 h-5" />}
                  </button>
                </div>
                <textarea
                    value={item.prompt}
                    onChange={(e) => onPromptTextChange(index, e.target.value)}
                    className="w-full flex-1 bg-gray-100/50 p-2 rounded-md border border-gray-300 focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all text-gray-700 resize-y font-mono text-sm"
                    rows={5}
                    aria-label={`Prompt cho phân đoạn ${item.segment}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

interface AnalysisPanelProps {
    prompts: AudioPrompt[];
    playingPromptId: number | null;
    onPlayPrompt: (prompt: AudioPrompt) => void;
    fileName: string;
    isPlaybackEnabled: boolean;
}

const AnalysisPanel: FC<AnalysisPanelProps> = ({ prompts, playingPromptId, onPlayPrompt, fileName, isPlaybackEnabled }) => (
    <div className="w-full space-y-6">
       <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg sticky top-0 z-10 border border-gray-200 shadow-sm">
         <h2 className="text-xl font-bold text-gray-800">Phân tích tệp <span className="text-cyan-600">{fileName}</span></h2>
         <p className="text-gray-500">Tìm thấy {prompts.length} phân đoạn</p>
         {!isPlaybackEnabled && <p className="text-xs text-yellow-600 mt-2">(Không thể phát lại âm thanh cho phiên đã lưu)</p>}
       </div>
       <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1 rounded-md">
         {prompts.map((prompt) => (
           <PromptItem
             key={prompt.id}
             prompt={prompt}
             isPlaying={playingPromptId === prompt.id}
             onPlay={() => onPlayPrompt(prompt)}
             isPlaybackEnabled={isPlaybackEnabled}
           />
         ))}
       </div>
    </div>
);

interface DirectorPanelProps {
    musicStyle: string;
    setMusicStyle: (value: string) => void;
    mood: string;
    setMood: (value: string) => void;
}

const DirectorPanel: FC<DirectorPanelProps> = ({
    musicStyle, setMusicStyle,
    mood, setMood
}) => {
    return (
        <div className="w-full p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-cyan-600">Bảng Điều Khiển của Đạo Diễn</h3>
            <p className="text-gray-500 -mt-3 mb-4 text-sm">Tinh chỉnh các yếu tố tổng thể để đảm bảo sự đồng nhất cho MV.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="musicStyle" className="block text-sm font-medium text-gray-700 mb-1">Phong cách nhạc</label>
                    <input
                        type="text"
                        id="musicStyle"
                        value={musicStyle}
                        onChange={(e) => setMusicStyle(e.target.value)}
                        className="w-full bg-gray-100/50 p-2 rounded-md border border-gray-300 focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">Tâm trạng chính</label>
                    <input
                        type="text"
                        id="mood"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full bg-gray-100/50 p-2 rounded-md border border-gray-300 focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
};


interface StoryboardPanelProps {
  onGenerateMusicPrompts: () => void;
  onAnalyzeMusicStyle: () => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  generationError: string | null;
  musicPrompts: MusicPrompt[] | null;
  onPromptTextChange: (promptIndex: number, newText: string) => void;
  onDownload: () => void;
  loadingMessage: string;
  directorPanelProps: DirectorPanelProps;
  showDirectorPanel: boolean;
  actorDescriptions: string[];
  setActorDescriptions: (value: string[]) => void;
  includeDanceScenes: boolean;
  setIncludeDanceScenes: (value: boolean) => void;
  apiKeysAvailable: boolean;
}

const StoryboardPanel: FC<StoryboardPanelProps> = (props) => {
  const { 
    onGenerateMusicPrompts, onAnalyzeMusicStyle, isGenerating, isAnalyzing, generationError, 
    musicPrompts, onPromptTextChange, onDownload, loadingMessage,
    directorPanelProps, showDirectorPanel,
    actorDescriptions, setActorDescriptions,
    includeDanceScenes, setIncludeDanceScenes,
    apiKeysAvailable
  } = props;
  
  const handleActorDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...actorDescriptions];
    newDescriptions[index] = value;
    setActorDescriptions(newDescriptions);
  };

  const addActor = () => {
    if (actorDescriptions.length < 3) {
      setActorDescriptions([...actorDescriptions, '']);
    }
  };

  const removeActor = (index: number) => {
    if (actorDescriptions.length > 1) {
      const newDescriptions = actorDescriptions.filter((_, i) => i !== index);
      setActorDescriptions(newDescriptions);
    }
  };

  const isAnalyzeDisabled = isAnalyzing || !apiKeysAvailable;
  const isGenerateDisabled = isGenerating || !apiKeysAvailable;

  return (
    <div className="w-full space-y-6">
        <div className="pt-6 border-t border-gray-200 lg:border-t-0 lg:pt-0">
            {!showDirectorPanel && !musicPrompts && !isGenerating && !isAnalyzing && (
              <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl text-center border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold mb-4">Bước 2: Phân tích phong cách</h3>
                  <p className="text-gray-500 mb-6">Phân tích toàn bộ bài hát để xác định phong cách, tâm trạng và đề xuất nhân vật.</p>
                  <button
                      onClick={onAnalyzeMusicStyle}
                      disabled={isAnalyzeDisabled}
                      className="w-full mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow"
                      title={!apiKeysAvailable ? "Vui lòng thêm API key trong phần Cài đặt" : ""}
                  >
                      {isAnalyzing ? 'Đang phân tích...' : 'Phân Tích Phong Cách Nhạc'}
                  </button>
                  {!apiKeysAvailable && <p className="text-yellow-600 text-xs mt-2">Vui lòng thêm API key trong Cài đặt để tiếp tục.</p>}
              </div>
            )}
            
            {showDirectorPanel && !musicPrompts && (
                <>
                    <DirectorPanel {...directorPanelProps} />

                     <div className="my-6 p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg space-y-6">
                        <h4 className="text-xl font-bold text-center text-cyan-600">Tùy Chỉnh Video</h4>
                        
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                             <h5 className="font-bold text-indigo-600">Cài đặt Nhân vật & Cảnh quay</h5>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả các nhân vật (1-3)</label>
                            {actorDescriptions.map((desc, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={desc}
                                        onChange={(e) => handleActorDescriptionChange(index, e.target.value)}
                                        className="w-full bg-gray-100/50 p-2 rounded-md border border-gray-300 focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                        placeholder={`Mô tả nhân vật ${index + 1}`}
                                    />
                                    {actorDescriptions.length > 1 && (
                                        <button onClick={() => removeActor(index)} className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addActor} disabled={actorDescriptions.length >= 3} className="text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                Thêm nhân vật
                            </button>
                            <div className="flex items-center pt-2">
                                 <input
                                    type="checkbox"
                                    id="includeDanceScenes"
                                    checked={includeDanceScenes}
                                    onChange={(e) => setIncludeDanceScenes(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <label htmlFor="includeDanceScenes" className="ml-2 block text-sm text-gray-700">
                                    Bao gồm cảnh vũ đạo
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onGenerateMusicPrompts}
                        disabled={isGenerateDisabled}
                        className="w-full mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                        title={!apiKeysAvailable ? "Vui lòng thêm API key trong phần Cài đặt" : ""}
                    >
                         {isGenerating ? 'Đang tạo...' : 'Bước 3: Tạo Prompt Chi Tiết'}
                    </button>
                     {!apiKeysAvailable && !isGenerating && <p className="text-yellow-600 text-xs mt-2 text-center">Vui lòng thêm API key trong Cài đặt để tiếp tục.</p>}
                </>
            )}

            <div className="mt-8 flex flex-col items-center">
                {(isGenerating || isAnalyzing) && <Spinner message={loadingMessage || "Đang xử lý..."} />}
                {generationError && (
                    <div className="text-center p-4 bg-red-100/50 border border-red-300 rounded-lg">
                        <p className="font-semibold text-red-700">Tạo prompt thất bại</p>
                        <p className="text-red-600 mt-1 text-sm">{generationError}</p>
                    </div>
                )}
                {musicPrompts && <MusicPromptsDisplay prompts={musicPrompts} onPromptTextChange={onPromptTextChange} onDownload={onDownload} />}
            </div>
       </div>
    </div>
  );
};


interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

const HistoryPanel: FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, onClearAll }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50/80 backdrop-blur-xl shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Lịch sử</h2>
                    <button onClick={onClose} className="text-2xl leading-none p-1 rounded-full hover:bg-gray-200">&times;</button>
                </div>
                {history.length === 0 ? (
                    <p className="p-4 text-gray-500">Chưa có lịch sử.</p>
                ) : (
                    <div className="flex flex-col h-[calc(100%-120px)]">
                        <ul className="overflow-y-auto flex-grow p-2 space-y-2">
                            {history.map(entry => (
                                <li key={entry.id} className="group bg-white/50 rounded-md hover:bg-gray-100/70 transition-colors border border-gray-200">
                                    <div className="flex items-center justify-between p-3">
                                        <button onClick={() => onLoad(entry.id)} className="text-left flex-grow">
                                            <p className="font-semibold truncate text-gray-800">{entry.fileName}</p>
                                            <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString('vi-VN')}</p>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(entry.id)} 
                                            className="ml-4 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Xóa mục"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <div className="p-4 border-t border-gray-200">
                            <button onClick={onClearAll} className="w-full text-center text-sm py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 font-semibold transition-colors">
                                Xóa tất cả lịch sử
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (keys: string[]) => void;
    initialKeys: string[];
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
    const [keys, setKeys] = useState(initialKeys.join('\n'));

    useEffect(() => {
        setKeys(initialKeys.join('\n'));
    }, [initialKeys, isOpen]);

    const handleSave = () => {
        const keyArray = keys.split('\n').map(k => k.trim()).filter(Boolean);
        onSave(keyArray);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-2xl">
                <h3 className="text-xl font-bold text-cyan-600 mb-4">Cài đặt API Key</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Dán các API key của bạn vào đây, mỗi key một dòng. Ứng dụng sẽ tự động sử dụng key tiếp theo nếu key hiện tại hết hạn mức.
                </p>
                <textarea
                    value={keys}
                    onChange={(e) => setKeys(e.target.value)}
                    className="w-full h-40 bg-gray-50 p-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono text-sm"
                    placeholder="AIzaSy...&#10;AIzaSy...&#10;..."
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold text-gray-700">
                        Hủy
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold text-white shadow">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};


const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels: Float32Array[] = [];
    let i: number;
    let sample: number;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };

    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    // Write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // Write "fmt " chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // chunk size
    setUint16(1); // audio format 1
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Write "data" chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk size

    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
};

const App: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompts, setPrompts] = useState<AudioPrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [playingPromptId, setPlayingPromptId] = useState<number | null>(null);
  
  const [musicPrompts, setMusicPrompts] = useState<MusicPrompt[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // API Key Management State
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Director's Panel state
  const [musicStyle, setMusicStyle] = useState('');
  const [mood, setMood] = useState('');
  const [actorDescriptions, setActorDescriptions] = useState<string[]>(['']);
  const [includeDanceScenes, setIncludeDanceScenes] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDirectorPanel, setShowDirectorPanel] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const initialAnalysisPending = useRef(false);

  const CHUNK_DURATION = 8; // 8 seconds

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('audioStoryboardHistory');
        if (storedHistory) {
            const parsed = JSON.parse(storedHistory);
            if (Array.isArray(parsed)) {
                 setHistory(parsed);
            }
        }
        const storedKeys = localStorage.getItem('geminiApiKeys');
        if (storedKeys) {
            const parsedKeys = JSON.parse(storedKeys);
            if (Array.isArray(parsedKeys) && parsedKeys.every(k => typeof k === 'string')) {
                setApiKeys(parsedKeys);
            }
        }
    } catch (e) {
        console.error("Không thể tải dữ liệu từ localStorage", e);
    }
  }, []);

  const saveHistory = (newHistory: HistoryEntry[]) => {
    try {
        localStorage.setItem('audioStoryboardHistory', JSON.stringify(newHistory));
        setHistory(newHistory);
    } catch (e) {
        console.error("Không thể lưu lịch sử vào localStorage", e);
    }
  };

  const handleSaveApiKeys = (keys: string[]) => {
    try {
        localStorage.setItem('geminiApiKeys', JSON.stringify(keys));
        setApiKeys(keys);
        setCurrentApiKeyIndex(0); // Reset index when keys are updated
    } catch (e) {
        console.error("Không thể lưu API keys vào localStorage", e);
    }
  };


  const resetState = useCallback(() => {
    setFile(null);
    setPrompts([]);
    setError(null);
    setAudioBuffer(null);
    setPlayingPromptId(null);
    if(sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
    }
    setMusicPrompts(null);
    setIsGenerating(false);
    setGenerationError(null);
    setIsLoading(false);
    setLoadingMessage('');
    
    // Don't reset API key index on new file, only on key save.
    
    setMusicStyle('');
    setMood('');
    setActorDescriptions(['']);
    setIncludeDanceScenes(false);
    
    setIsAnalyzing(false);
    setShowDirectorPanel(false);
    initialAnalysisPending.current = false;
  }, []);
  
  const runRequestWithKeyRotation = useCallback(async (requestFn: (apiKey: string) => Promise<string>): Promise<string> => {
    if (apiKeys.length === 0) {
        throw new Error("Không có API key nào được cấu hình. Vui lòng thêm key trong Cài đặt.");
    }

    let lastError: any = new Error("Tất cả API key đã hết hạn mức. Vui lòng thêm key mới và thử lại.");

    for (let i = 0; i < apiKeys.length; i++) {
        const keyIndex = (currentApiKeyIndex + i) % apiKeys.length;
        const currentKey = apiKeys[keyIndex];

        try {
            const result = await requestFn(currentKey);
            setCurrentApiKeyIndex(keyIndex); // Remember the last successful key index
            return result;
        } catch (err) {
            const error = err as any;
            const isRateLimitError = error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'));
            
            lastError = error;

            if (isRateLimitError) {
                console.warn(`API key tại index ${keyIndex} đã hết hạn mức. Thử key tiếp theo...`);
                // Continue to the next key in the loop
            } else {
                // A different kind of error, re-throw it immediately
                throw error;
            }
        }
    }
    // This part is reached if all keys failed with rate limit errors
    throw lastError;
  }, [apiKeys, currentApiKeyIndex]);

   const handleAnalyzeMusicStyle = useCallback(async () => {
    if (!file || !audioBuffer) return;

    setIsAnalyzing(true);
    setGenerationError(null);
    setLoadingMessage('Phân tích tổng thể bài hát...');

    try {
        const resultText = await runRequestWithKeyRotation(async (apiKey) => {
             const ai = new GoogleGenAI({ apiKey });

            const analysisDuration = Math.min(60, audioBuffer.duration);
            const frameCount = Math.floor(analysisDuration * audioBuffer.sampleRate);
            const segmentBuffer = audioContextRef.current!.createBuffer(
                audioBuffer.numberOfChannels,
                frameCount,
                audioBuffer.sampleRate
            );
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                segmentBuffer.getChannelData(i).set(audioBuffer.getChannelData(i).subarray(0, frameCount));
            }
            const wavBlob = audioBufferToWav(segmentBuffer);
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(wavBlob);
            });

            const prompt = `You are a music expert. Analyze this audio clip and provide a concise summary in JSON format. Identify the music style/genre, the main mood, and suggest a simple description for the main character/singer suitable for a music video.

            Your response MUST be a single, valid JSON object with the following keys: "musicStyle", "mood", "actorDescription".
            Example:
            {"musicStyle": "Vietnamese Pop Ballad", "mood": "Melancholic, Hopeful", "actorDescription": "Young female singer in her early 20s"}
            `;
            
            const audioPart = { inlineData: { mimeType: 'audio/wav', data: base64Data } };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [audioPart, textPart] },
            });
            return response.text;
        });

        const cleanedText = resultText.trim().replace(/```json|```/g, '');
        const resultJson = JSON.parse(cleanedText);

        setMusicStyle(resultJson.musicStyle || 'Không xác định');
        setMood(resultJson.mood || 'Không xác định');
        setActorDescriptions([resultJson.actorDescription || 'Ca sĩ']);
        setShowDirectorPanel(true);

    } catch (err) {
        const error = err as any;
        console.error("Lỗi phân tích phong cách:", error);
        const errorMessage = (error instanceof Error) ? error.message : "Lỗi không xác định. Vui lòng thử lại.";
        setGenerationError(errorMessage);
        setMusicStyle('Pop');
        setMood('Upbeat');
        setActorDescriptions(['Singer']);
        setShowDirectorPanel(true);
    } finally {
        setIsAnalyzing(false);
        setLoadingMessage('');
    }
}, [file, audioBuffer, runRequestWithKeyRotation]);

  const handleFileUpload = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Loại tệp không hợp lệ. Vui lòng tải lên tệp âm thanh được hỗ trợ.');
      return;
    }
     if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError('Kích thước tệp vượt quá 50MB. Vui lòng tải lên một tệp nhỏ hơn.');
      return;
    }
    resetState();
    setFile(selectedFile);
    setIsLoading(true);

    const reader = new FileReader();
    setLoadingMessage('Đang đọc tệp...');
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        setLoadingMessage('Đang giải mã dữ liệu âm thanh...');
        const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);

        setLoadingMessage('Đang phân đoạn âm thanh...');
        const totalDuration = decodedBuffer.duration;
        const numChunks = Math.ceil(totalDuration / CHUNK_DURATION);
        const generatedPrompts: AudioPrompt[] = [];

        for (let i = 0; i < numChunks; i++) {
          const startTime = i * CHUNK_DURATION;
          const endTime = Math.min(startTime + CHUNK_DURATION, totalDuration);
          generatedPrompts.push({
            id: i,
            startTime,
            endTime,
            duration: endTime - startTime,
          });
        }
        initialAnalysisPending.current = true;
        setPrompts(generatedPrompts);

      } catch (err) {
        setError('Không thể xử lý tệp âm thanh. Tệp có thể bị hỏng hoặc có định dạng không được hỗ trợ.');
        console.error(err);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };
    reader.onerror = () => {
        setError('Không thể đọc tệp.');
        setIsLoading(false);
        setLoadingMessage('');
    };

    reader.readAsArrayBuffer(selectedFile);
  }, [resetState]);

  useEffect(() => {
    if (initialAnalysisPending.current && prompts.length > 0) {
      initialAnalysisPending.current = false; // Consume the flag to prevent re-runs
      handleAnalyzeMusicStyle();
    }
  }, [prompts, handleAnalyzeMusicStyle]);

  const handlePlayPrompt = useCallback((prompt: AudioPrompt) => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current = null;
    }

    if (playingPromptId === prompt.id) {
      setPlayingPromptId(null);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start(0, prompt.startTime, prompt.duration);
    
    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setPlayingPromptId(null);
        sourceNodeRef.current = null;
      }
    };

    sourceNodeRef.current = source;
    setPlayingPromptId(prompt.id);
  }, [audioBuffer, playingPromptId]);

  const handlePromptTextChange = (promptIndex: number, newText: string) => {
    if (!musicPrompts) return;

    setMusicPrompts(prev => {
        if (!prev) return null;
        const newPrompts = [...prev];
        if(newPrompts[promptIndex]) {
            newPrompts[promptIndex] = { ...newPrompts[promptIndex], prompt: newText };
            return newPrompts;
        }
        return prev;
    });
  };
  
  const handleGenerateMusicPrompts = async () => {
    if (prompts.length === 0 || !audioBuffer || !audioContextRef.current || !file) return;

    setMusicPrompts([]);
    setIsGenerating(true);
    setGenerationError(null);
    
    let accumulatedPrompts: MusicPrompt[] = [];
    let previousSceneDescription = "Đây là cảnh mở đầu của video ca nhạc.";

    for (let i = 0; i < prompts.length; i++) {
        const promptChunk = prompts[i];
        setLoadingMessage(`Đang xử lý phân đoạn ${i + 1} / ${prompts.length}...`);
        
        try {
            const pStr = await runRequestWithKeyRotation(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });

                const frameCount = Math.floor(promptChunk.duration * audioBuffer.sampleRate);
                const segmentBuffer = audioContextRef.current!.createBuffer(
                    audioBuffer.numberOfChannels,
                    frameCount,
                    audioBuffer.sampleRate
                );
                for (let j = 0; j < audioBuffer.numberOfChannels; j++) {
                    const channelData = audioBuffer.getChannelData(j);
                    const segmentData = segmentBuffer.getChannelData(j);
                    const startOffset = Math.floor(promptChunk.startTime * audioBuffer.sampleRate);
                    segmentData.set(channelData.subarray(startOffset, startOffset + frameCount));
                }
                const wavBlob = audioBufferToWav(segmentBuffer);
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(wavBlob);
                });
                
                const charactersString = actorDescriptions.map((desc, i) => `- Nhân vật ${i + 1}: ${desc}`).join('\n');
                const userPromptForChunk = `You are an expert AI director for Vietnamese music videos. Your task is to analyze the provided 8-second audio segment and generate a creative, descriptive visual prompt for a video generation model, forming part of a larger narrative.

**--- OVERALL PROJECT CONTEXT ---**
- **Music Style:** ${musicStyle}
- **Mood:** ${mood}
- **Main Characters:**
${charactersString}
- **Dance Option:** ${includeDanceScenes ? 'Include dynamic, synchronized dance scenes with a dance crew where appropriate (e.g., during energetic choruses or instrumental breaks). The dance style should match the music and mood.' : 'This is a film-style MV. Focus purely on cinematic storytelling and character acting. Do not include dance crew scenes.'}

**--- PREVIOUS SCENE CONTEXT ---**
The previous scene was described as: "${previousSceneDescription}"

**--- YOUR TASK FOR THIS SEGMENT (Segment #${promptChunk.id + 1}) ---**
1.  **Analyze Content:** Listen to the audio. If there are lyrics, understand their meaning and emotion. If it's instrumental, capture the atmosphere. Analyze the rhythm and beat to suggest synchronized movements or camera actions.
2.  **Generate a Visual Prompt:** Write a single, numbered, descriptive prompt for a visual scene.
    *   The scene MUST consistently feature one or more of the defined main characters.
    *   **CRITICAL RULE: ACTING SCENE (NO LIP-SYNC):** This is a narrative scene where characters act to tell the song's story. They are **NOT** singing or lip-syncing.
    *   **CRITICAL RULE: ENSURE CONTINUITY:** Your new scene must seamlessly connect to the previous one. Maintain logical consistency in character position, setting, and action. Suggest camera movements (e.g., pan, dolly) or cuts that create a smooth, continuous flow. The transition must feel natural and motivated by the music.
    *   Incorporate diverse, cinematic camera angles (e.g., close-up, wide shot, tracking shot, dolly zoom, low-angle shot).

**--- FINAL OUTPUT RULE ---**
Your entire response must be ONLY the final descriptive text prompt, starting with the segment number '${promptChunk.id + 1}. '. Absolutely no other text, markdown, JSON, or explanations.`;
                

                const audioPart = { inlineData: { mimeType: 'audio/wav', data: base64Data } };
                const textPart = { text: userPromptForChunk };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [audioPart, textPart] },
                });
                
                return response.text.trim();
            });
            
            const newMusicPrompt: MusicPrompt = {
                segment: promptChunk.id + 1,
                prompt: pStr,
            };
            
            accumulatedPrompts.push(newMusicPrompt);
            setMusicPrompts([...accumulatedPrompts]);
            previousSceneDescription = pStr;

        } catch(err) {
            const error = err as any;
            console.error(`Lỗi tạo prompt cho phân đoạn ${i+1}:`, error);
            const errorMessage = error instanceof Error ? error.message : `Lỗi không xác định ở phân đoạn ${i+1}.`;
            setGenerationError(errorMessage);
            setIsGenerating(false);
            setLoadingMessage('');
            return;
        }
    }

    const newEntry: HistoryEntry = {
        id: `${Date.now()}-${file.name}`,
        timestamp: Date.now(),
        fileName: file.name,
        prompts,
        musicPrompts: accumulatedPrompts,
        musicStyle,
        actorDescriptions,
        mood,
        includeDanceScenes,
    };
    saveHistory([newEntry, ...history]);
    setIsGenerating(false);
    setLoadingMessage('');
  };

  const loadHistoryEntry = (id: string) => {
    const entry = history.find(item => item.id === id);
    if (entry) {
        resetState();
        setFile({ name: entry.fileName, type: 'audio/mpeg' } as File); // Mock file for name display
        setPrompts(entry.prompts);
        setMusicPrompts(entry.musicPrompts);
        setMusicStyle(entry.musicStyle || '');
        setActorDescriptions(entry.actorDescriptions || ['']);
        setMood(entry.mood || '');
        setIncludeDanceScenes(entry.includeDanceScenes || false);
        setShowDirectorPanel(!!entry.musicStyle); // Show panel if data exists
        setAudioBuffer(null); // IMPORTANT: No audio buffer for history items
        setIsHistoryPanelOpen(false);
    }
  };

  const deleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistory(updatedHistory);
  };
  
  const clearAllHistory = () => {
    saveHistory([]);
  };

  const handleDownload = () => {
    if (!musicPrompts || !file) return;

    let header = `--- KỊCH BẢN VIDEO ---\n`;
    header += `Tệp Âm Thanh: ${file.name}\n`;
    header += `Phong Cách Nhạc: ${musicStyle}\n`;
    header += `Tâm Trạng: ${mood}\n`;
    header += `Bao Gồm Cảnh Vũ Đạo: ${includeDanceScenes ? 'Có' : 'Không'}\n`;
    actorDescriptions.forEach((desc, i) => {
        header += `Nhân Vật ${i + 1}: ${desc || 'Không xác định'}\n`;
    });
    header += `------------------------\n\n`;

    const content = musicPrompts.map(p => p.prompt).join('\n\n');
    const fullContent = header + content;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kịch-bản-${file.name.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Spinner message={loadingMessage} /></div>;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100/50 border border-red-300 rounded-lg">
          <p className="text-xl font-semibold text-red-700">Đã xảy ra lỗi</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button onClick={resetState} className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow">
            Thử lại
          </button>
        </div>
      );
    }
    if (prompts.length > 0 && file) {
      return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            <StoryboardPanel 
                onAnalyzeMusicStyle={handleAnalyzeMusicStyle}
                onGenerateMusicPrompts={handleGenerateMusicPrompts}
                isGenerating={isGenerating}
                isAnalyzing={isAnalyzing}
                generationError={generationError}
                musicPrompts={musicPrompts}
                onPromptTextChange={handlePromptTextChange}
                onDownload={handleDownload}
                loadingMessage={loadingMessage}
                showDirectorPanel={showDirectorPanel}
                directorPanelProps={{
                    musicStyle, setMusicStyle,
                    mood, setMood
                }}
                actorDescriptions={actorDescriptions}
                setActorDescriptions={setActorDescriptions}
                includeDanceScenes={includeDanceScenes}
                setIncludeDanceScenes={setIncludeDanceScenes}
                apiKeysAvailable={apiKeys.length > 0}
            />
        </div>
      );
    }
    return <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
       <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialKeys={apiKeys}
        onSave={handleSaveApiKeys}
       />
       <HistoryPanel 
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            history={history}
            onLoad={loadHistoryEntry}
            onDelete={deleteHistoryEntry}
            onClearAll={clearAllHistory}
        />
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex-1 flex justify-start">
            <button 
                onClick={resetState}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold transition-colors text-sm shadow-sm"
            >
                <PlusIcon className="w-5 h-5"/>
                Phiên Mới
            </button>
        </div>
        <div className="text-center flex-shrink-0 px-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
            Nhạc sang <span className="text-cyan-600">Video Prompt</span>
            </h1>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
            <button 
                onClick={() => setIsHistoryPanelOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold transition-colors text-sm shadow-sm"
                aria-label="Mở lịch sử"
            >
                <HistoryIcon className="w-5 h-5"/>
                <span className="hidden md:inline">Lịch sử</span>
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold transition-colors text-sm shadow-sm"
                aria-label="Mở cài đặt"
            >
                <SettingsIcon className="w-5 h-5"/>
                 <span className="hidden md:inline">Cài đặt</span>
            </button>
        </div>
      </header>
       <p className="text-lg text-gray-500 max-w-2xl mx-auto text-center -mt-4 mb-10">
          Tải lên một bài hát để tạo kịch bản video chi tiết.
        </p>
      <main className="w-full flex items-center justify-center flex-grow">
        {renderContent()}
      </main>
      <footer className="text-center text-gray-400 mt-12 text-sm">
        <p>Xây dựng với React, TypeScript, và Tailwind CSS. Hỗ trợ bởi Web Audio API và Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
