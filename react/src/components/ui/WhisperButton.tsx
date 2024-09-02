import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import { transcribeAudio } from '@/components/lib/API';
import Toast from '@/components/ui/Toast';

const blinkingStyle = {
  animation: 'blink 1.3s infinite'
};

const blinkKeyframes = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

interface WhisperButtonProps {
  disabled?: boolean;
  platform: string;
  onTranscription: (transcription: string) => void;
  onRecording: (recording: boolean) => void;
}

export default function WhisperButton({ disabled = false, onTranscription, onRecording, platform }: WhisperButtonProps): JSX.Element {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const { JWTtoken } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = async () => {
    if (!JWTtoken) {
      Toast.fire({
        icon: 'error',
        title: "請先登入以使用語音輸入",
      });
      return;
    }

    if (disabled) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStreamRef.current = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = [];

      const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
      const result = await transcribeAudio(audioFile, JWTtoken, platform);

      if (result.statusCode == 200) {
        onTranscription(result.transcript);
      } else {
        Toast.fire({
          icon: 'error',
          title: result.message,
        });
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    onRecording(true);

    // 設置30秒計時器
    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
      Toast.fire({
        icon: 'info',
        title: "錄音已達到30秒限制，自動停止。",
      });
    }, 30000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecording(false);
    }
  };

  return (
    <>
      <style>
        {blinkKeyframes}
      </style>
      <button
        className={`rounded-lg bg-slateBlue hover:bg-darkSlateBlue my-1 ${disabled && "cursor-not-allowed"}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
      >
        <div className="w-4  flex justify-center items-center">
          {isRecording ?
            <RecordingIcon />
            : disabled ? <i className="fa-solid fa-microphone-slash"></i> : <i className="fa-solid fa-microphone"></i>
          }
        </div>
      </button>
    </>
  );
}

const RecordingIcon = () => {
  return (
    <div className="relative flex items-center justify-center" style={blinkingStyle}>
      <div className="absolute flex items-center justify-center w-5 h-5 border-2 border-red-600 rounded-full">
        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
      </div>
    </div>
  );
}
