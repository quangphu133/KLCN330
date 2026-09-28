'use client';

import { Stt } from '@/entities/mediafile/api/mediafile.types';
import React, { useEffect, useState, useRef } from 'react';

export type MessageType = {
  text: string;
  sender: 'customer' | 'agent' | 'unknown';
  time: string;
  startChar: number;
  endChar: number;
  startTime: number | null;
  endTime: number | null;
  id: string;
  isMono?: boolean;
  speakerLabel?: string;
  regions?: {
    channel: number;
    startChar: number;
    endChar: number;
    startTime: number;
    endTime: number;
  }[];
};

interface STTChunk {
  channel: number;
  startChar: number;
  endChar: number;
  startTime: number | null;
  endTime: number | null;
  text: string;
  regions?: {
    channel: number;
    startChar: number;
    endChar: number;
    startTime: number;
    endTime: number;
  }[];
  speaker?: string | null;
  speakerId?: string | null;
}

interface CallInfoData {
  name: string;
  phone: string;
  date: string | undefined;
  duration: string | null;
}

interface TranscriptProps {
  callInfo: CallInfoData;
  Stt?: Stt | null;
  currentPlayerTime?: number;
  summary: string;
}

interface TextProps {
  text: string;
  currentPlayerTime: number;
  message: MessageType;
}

export const processStt = (Stt: Stt): MessageType[] => {
  if (!Stt || !Stt.chunks || Stt.chunks.length === 0) {
    return [];
  }

  const hasChannel0 = Stt.chunks.some((chunk) => chunk.channel === 0);
  const hasChannel1 = Stt.chunks.some((chunk) => chunk.channel === 1);
  const speakerIds = Array.from(
    new Set(Stt.chunks.map((chunk) => chunk.speakerId).filter(Boolean) as string[])
  );
  const speakerLabels = new Map(speakerIds.map((speakerId, index) => [speakerId, `Người nói ${index + 1}`]));
  const hasSpeakerLabels = speakerIds.length > 0 || Stt.chunks.some(
    (chunk) => chunk.speaker === 'agent' || chunk.speaker === 'customer'
  );
  const isConversation = (hasChannel0 && hasChannel1) || hasSpeakerLabels;

  const messages: MessageType[] = [];

  if (isConversation) {
    let currentMessage: MessageType | null = null;

    Stt.chunks.forEach((chunk, index) => {
      const minutes = chunk.startTime === null ? null : Math.floor(chunk.startTime / 60);
      const seconds = chunk.startTime === null ? null : Math.floor(chunk.startTime % 60);
      const formattedTime = minutes === null || seconds === null
        ? '--:--'
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const sender =
        chunk.speaker === 'agent' || chunk.speaker === 'customer'
          ? chunk.speaker
          : chunk.speakerId
            ? 'unknown'
            : chunk.channel === 0
            ? 'customer'
            : 'agent';
      const speakerLabel = chunk.speaker === 'agent'
        ? 'Nhân viên'
        : chunk.speaker === 'customer'
          ? 'Khách hàng'
          : chunk.speakerId
            ? speakerLabels.get(chunk.speakerId)
            : undefined;

      const shouldCombineWithPrevious =
        currentMessage &&
        currentMessage.sender === sender &&
        currentMessage.speakerLabel === speakerLabel &&
        currentMessage.endTime !== null &&
        chunk.startTime !== null &&
        Math.abs(currentMessage.endTime - chunk.startTime) < 2;

      if (shouldCombineWithPrevious && currentMessage) {
        currentMessage.text += ' ' + chunk.text.trim();
        currentMessage.endTime = chunk.endTime;
      } else {
        currentMessage = {
          text: chunk.text.trim(),
          sender,
          startChar: chunk.startChar,
          endChar: chunk.endChar,
          time: formattedTime,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          regions: chunk.regions,
          id: `message-${index}-${Date.now()}`,
          isMono: !hasSpeakerLabels && !hasChannel1,
          speakerLabel,
        };
        messages.push(currentMessage);
      }
    });
  } else {
    Stt.chunks.forEach((chunk, index) => {
      const minutes = chunk.startTime === null ? null : Math.floor(chunk.startTime / 60);
      const seconds = chunk.startTime === null ? null : Math.floor(chunk.startTime % 60);
      const formattedTime = minutes === null || seconds === null
        ? '--:--'
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const sender = 'unknown' as const;

      const message = {
        text: chunk.text.trim(),
        sender,
        time: formattedTime,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        regions: chunk.regions,
        id: `message-${index}-${Date.now()}`,
        isMono: true,
      };

      messages.push(message);
    });
  }

  return messages;
};

export const Text: React.FC<TextProps> = ({
  text,
  currentPlayerTime,
  message,
}) => {
  if (
    message.startTime !== null &&
    message.endTime !== null &&
    currentPlayerTime >= message.startTime &&
    currentPlayerTime <= message.endTime
  ) {
    const activeWord = message.regions?.find(
      (region) =>
        currentPlayerTime >= region.startTime &&
        currentPlayerTime <= region.endTime
    );
    if (activeWord) {
      const first = message?.text.substring(
        0,
        activeWord.startChar - message.startChar
      );
      const word = message?.text.substring(
        activeWord.startChar - message.startChar,
        activeWord.endChar - message.startChar
      );
      const second = message?.text.substring(
        activeWord.endChar - message.startChar,
        message?.text.length
      );
      return (
        <p>
          {first}
          <span className="rounded-full bg-yellow-100 text-yellow-800">
            {word}
          </span>
          {second}
        </p>
      );
    } else {
      return <p>{text}</p>;
    }
    // console.log(text, currentPlayerTime, message);
  } else {
    return <p>{text}</p>;
  }
};

export const Transcript: React.FC<TranscriptProps> = ({
  callInfo,
  Stt,
  currentPlayerTime = 0,
  summary,
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (Stt) {
      const processedMessages = processStt(Stt);
      setMessages(processedMessages);
    }
  }, [Stt]);

  useEffect(() => {
    if (!messages.length || currentPlayerTime === undefined) return;

    const activeMessage = messages.find(
      (message) =>
        message.startTime !== null &&
        message.endTime !== null &&
        currentPlayerTime >= message.startTime &&
        currentPlayerTime <= message.endTime
    );

    if (activeMessage) {
      setActiveMessageId(activeMessage.id);
      const messageElement = messageRefs.current[activeMessage.id];
      if (messageElement && containerRef.current) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } else {
      setActiveMessageId(null);
    }
  }, [currentPlayerTime, messages]);

  return (
    // <div  /*className="max-h-[calc(100vh-480px)] overflow-y-hidden"*/>
    <div
      ref={containerRef}
      className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 overflow-y-hidden"
    >
      <div className="flex flex-col gap-6 p-4">
        <div className="items-center justify-between mb-6">
          {/* <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium">
                  {callInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <>
                    <p className="font-medium">{callInfo.name}</p>
                    <p className="text-gray-500 text-sm">{callInfo.phone}</p>
                  </>
                </div>
              </div> */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Điện thoại number</h2>
            <p className="font-medium">{callInfo.phone}</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-semibold">Call date/time</h5>
            <div className="font-medium">{callInfo.date}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Specialist</h2>
            <p className="font-medium">{callInfo.name}</p>
          </div>

          <div className="mb-4">
            <h2 className="font-semibold">Tóm tắt</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
          </div>
          {/*<Button*/}
          {/*  className="w-[164px] h-[44px] border border-gray-200 rounded-full hover:bg-gray-100 mb-2 flex items-center gap-2 cursor-pointer"*/}
          {/*  onClick={() => {}}*/}
          {/*>*/}
          {/*  <span>Chỉnh sửa</span>*/}
          {/*  <EditIcon width={20} height={20} />*/}
          {/*</Button>*/}
          {/* </div> */}
        </div>
      </div>
      <div className="flex flex-col gap-6 p-4 1max-h-[calc(100vh-500px)] overflow-y-auto">
        {messages.map((message) => {
          const isRightAligned = !message.isMono && message.sender === 'agent';
          return (
            <div
              key={message.id}
              ref={(el) => {
                messageRefs.current[message.id] = el;
              }}
              className={`flex ${isRightAligned ? 'justify-end' : 'justify-start'} 
                              transition-opacity duration-300 ${activeMessageId === message.id ? 'opacity-200' : 'opacity-200'}`}
            >
              <div
                className={`max-w-md ${activeMessageId === message.id ? 'transform transition-transform duration-300 scale-102' : ''}`}
              >
                <div
                  className={`py-2 px-4 rounded-2xl ${
                    message.isMono
                      ? 'bg-purple-100 text-purple-900'
                      : message.sender === 'agent'
                        ? 'bg-purple-700 text-white'
                        : message.sender === 'customer'
                          ? 'bg-purple-100 text-purple-900'
                          : message.speakerLabel?.endsWith('2')
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                  } ${activeMessageId === message.id ? 'ring-2 ring-purple-400' : ''}`}
                >
                  {/* <p>{message.text}</p> */}
                  <Text
                    text={message.text}
                    currentPlayerTime={currentPlayerTime}
                    message={message}
                  />
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isRightAligned ? 'text-right' : 'text-left'
                  }`}
                >
                {message.isMono
                    ? `Người nói chưa xác định, ${message.time}`
                    : `${message.speakerLabel ?? (message.sender === 'agent' ? 'Operator' : 'Người gọi')}, ${message.time}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    // </div>
  );
};
