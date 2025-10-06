export interface WhisperBoxApi {
  createWhisperBox: (data: { name: string; targetUser: string }) => void;
}

export interface WhisperBoxChatMessage {
  speaker: string | undefined;
  whisperedTo: string | undefined;
  content: string;
  className: string;
}
