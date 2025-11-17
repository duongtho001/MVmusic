
export interface AudioPrompt {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface MusicPrompt {
  segment: number;
  prompt: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  prompts: AudioPrompt[];
  musicPrompts: MusicPrompt[];
  musicStyle?: string;
  actorDescriptions?: string[];
  mood?: string;
  includeDanceScenes?: boolean;
}
