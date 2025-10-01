export interface WhisperBoxApi {
  createWhisperBox: (data: { name: string; targetUser: string }) => void;
}
