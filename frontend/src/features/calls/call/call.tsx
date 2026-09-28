'use client';

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Tab } from '@/shared/ui/tab/tab';
import PageBreadcrumb from '@/shared/ui/page-breadcrumb/page-breadcrumb';
import { Transcript } from './transcript/transcript';
import {
  Checklist,
  ChecklistGroup,
} from '@/features/calls/call/checklists/checklists';
import { Summary } from '@/features/calls/call/summary/summary';
import {
  useGetMediaFileByIdQuery,
  useGetMediaFileResultQuery,
  useConfirmSpeakerRolesMutation,
} from '@/entities/mediafile/api/mediafile.api';
import { useParams } from 'next/navigation';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { getFromLocalStorage } from '@/shared/utils/common-utils';
import { formatDatesTime, formatDates } from '@/shared/utils/date-utils';

import './call.css';
import { appRoutes } from '@/shared/constants/routes';
import { LoaderContent } from '@/shared/ui/loader';
import { toast } from 'react-toastify';

enum CallTab {
  Transcript = 'transcript',
  Summary = 'summary',
  Checklists = 'checklists',
}

type TabItem = {
  name: string;
  key: string;
};

type AudioIndicator = {
  type: string;
  color: string;
  regions?: {
    phrase?: string;
    start: number;
    end: number;
    channel?: number;
    actorByChannel?: number;
  }[];
};

export const Call = () => {
  const params = useParams();
  const id = Number(params.id);
  const token = getFromLocalStorage('accessToken', null);
  const isDemoMode = token === 'local-demo-token';
  const [isAudioLoading, setIsAudioLoading] = useState(!isDemoMode);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wavesurferReady, setWavesurferReady] = useState(isDemoMode);
  const regionsAddedRef = useRef(false);

  const { data: mediaFileById, isLoading } = useGetMediaFileByIdQuery({ id });

  const { data: mediaFileResult } = useGetMediaFileResultQuery({
    id,
    negativeProbThreshold: 0.15,
    simultaneousSilenceDurationThreshold: 10,
  });
  const [confirmSpeakerRoles, { isLoading: isConfirmingSpeakerRoles }] =
    useConfirmSpeakerRolesMutation();
  const diarization = mediaFileResult?.diarization?.status
    ? mediaFileResult.diarization
    : null;
  const roleMapping = mediaFileResult?.roleMapping;
  const [selectedAgentSpeakerId, setSelectedAgentSpeakerId] = useState('');

  useEffect(() => {
    const selected = roleMapping?.agent_speaker_id ?? roleMapping?.suggested_agent_speaker_id;
    if (selected && !selectedAgentSpeakerId) {
      setSelectedAgentSpeakerId(selected);
    }
  }, [roleMapping, selectedAgentSpeakerId]);

  const handleConfirmSpeakerRole = async () => {
    if (!selectedAgentSpeakerId) {
      toast.error('Vui lòng chọn người nói là nhân viên');
      return;
    }
    try {
      await confirmSpeakerRoles({ id, agentSpeakerId: selectedAgentSpeakerId }).unwrap();
      toast.success('Đã xác nhận vai trò người nói');
    } catch (error) {
      const apiError = error as { data?: { detail?: string } };
      toast.error(apiError.data?.detail ?? 'Không thể xác nhận vai trò người nói');
    }
  };

  const [activeTab, setActiveTab] = useState(CallTab.Transcript);
  const [playbackRate, setPlaybackRate] = useState('1x');

  const mouseEvent = (event: any) => {
    if (event.type === 'mouseover') {
      event.target.querySelector('#tooltip').style.opacity = '1';
    } else {
      event.target.querySelector('#tooltip').style.opacity = '0';
    }
  };

  const tooltipContent = (
    actualColor: string,
    region: any,
    indicator: { type: string }
  ) => {
    const inner = document.createElement('div');
    inner.id = 'tooltip';
    inner.style.borderRadius = '5px';
    inner.style.boxShadow = ' 2px 2px 6px -4px #999';
    inner.style.fontFamily = 'inherit';
    inner.style.padding = '4px';
    inner.style.border = '1px solid #e3e3e3';
    inner.style.background = 'rgba(255, 255, 255, .96)';
    inner.style.fontSize = '12px';
    inner.style.top = '-20px';
    inner.style.left = '20px';
    inner.style.opacity = '0';
    inner.style.pointerEvents = 'none';
    inner.style.position = 'absolute';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    inner.style.overflow = 'hidden';
    inner.style.whiteSpace = 'nowrap';
    inner.style.zIndex = '12';
    inner.style.transition = '.15s ease all';
    const header = document.createElement('div');
    header.style.display = 'flex';
    const indicatorPoint = document.createElement('div');
    indicatorPoint.style.backgroundColor = actualColor;
    indicatorPoint.style.borderRadius = '50%';
    indicatorPoint.style.margin = '4px';
    indicatorPoint.style.width = '8px';
    indicatorPoint.style.height = '8px';

    const indicatorType = document.createElement('span');
    if (region.phrase) {
      indicatorType.innerHTML =
        indicator.type +
        ': <span style="display: inline-block; margin-left: 4px; font-weight: 600;">' +
        region.phrase +
        '</span>';
    } else {
      indicatorType.innerHTML = indicator.type;
    }
    header.appendChild(indicatorPoint);
    header.appendChild(indicatorType);
    inner.appendChild(header);
    return inner;
  };

  const audioIndicators: AudioIndicator[] = useMemo(() => {
    return [
      {
        type: 'Tiêu cực',
        color: 'bg-red-400',
        regions:
          mediaFileResult?.tonal?.regions
            ?.filter((region) => region.type === 1)
            ?.map((region) => ({
              start: region.startTime,
              end: region.endTime,
              channel: region.channel,
            })) || [],
      },
      {
        type: 'Từ vựng',
        color: 'bg-blue-400',
        regions:
          mediaFileResult?.keywordsSearchResult?.regions?.map((region) => ({
            start: region.startTime,
            end: region.endTime,
            channel: region.channel !== undefined ? region.channel : 0,
            phrase: region.phrase,
          })) || [],
      },
      {
        type: 'Tạm dừng',
        color: 'bg-yellow-400',
        regions:
          mediaFileResult?.simultaneousSilence?.regions?.map((region) => ({
            start: region.startTime,
            end: region.endTime,
          })) || [],
      },
      {
        type: 'Ngắt lời',
        color: 'bg-red-500',
        regions:
          mediaFileResult?.simultaneousSpeech?.regions?.map((region) => ({
            start: region.startTime,
            end: region.endTime,
            channel:
              region.actorByChannel !== undefined ? region.actorByChannel : 0,
          })) || [],
      },
    ];
  }, [mediaFileResult]);

  const numChannels = mediaFileById?.numChannels ?? 0;
  const hasMultipleChannels = numChannels > 1;

  const createRegions = useCallback(() => {
    if (
      !wavesurferRef.current ||
      !regionsPluginRef.current ||
      regionsAddedRef.current
    )
      return;
    regionsPluginRef.current.clearRegions();

    audioIndicators.forEach((indicator) => {
      if (!indicator.regions) return;
      indicator.regions.forEach((region) => {
        const isCircleMarker =
          indicator.type === 'Ngắt lời' || indicator.type === 'Từ vựng';
        const isSilence = indicator.type === 'Tạm dừng';
        let actualColor;

        switch (indicator.color) {
          case 'bg-red-400':
            actualColor = '#ff6467'; // Màu đỏ nổi bật hơn cho nội dung tiêu cực
            break;
          case 'bg-blue-400':
            actualColor = '#639fe5'; // Màu xanh nổi bật hơn cho từ vựng
            break;
          case 'bg-yellow-400':
            actualColor = '#fce8c0'; // Màu vàng cho đoạn tạm dừng
            break;
          case 'bg-red-500':
            actualColor = '#fb2c36'; // Màu xanh lục cho đoạn ngắt lời
            break;
          default:
            actualColor = 'rgba(107, 33, 168, 0.5)'; // Màu tím mặc định
        }

        if (isCircleMarker) {
          const regionId = `marker-${indicator.type}-${region.start}-${region.channel || 0}`;

          const markerRegion = regionsPluginRef.current.addRegion({
            id: regionId,
            start: region.start,
            end: region.start + 1,
            color: 'rgba(0,0,0,0)',
            drag: false,
            resize: false,
            channelIdx: region.channel,
            channel: region.channel,
            markerType: indicator.type,
          });

          if (markerRegion && markerRegion.element) {
            markerRegion.element.style.zIndex = '100';
            const circle = document.createElement('div');
            circle.className = 'marker-circle';
            circle.style.position = 'absolute';
            circle.style.width = '15px';
            circle.style.height = '15px';
            circle.style.border = '1px solid rgba(0, 0, 0, 0.3)';
            circle.style.borderRadius = '50%';
            circle.style.backgroundColor = actualColor;
            circle.style.top = '50%';
            circle.style.left = '0';
            circle.style.cursor = 'pointer';
            circle.style.transform = 'translate(-50%, -50%)';
            circle.setAttribute(
              'style',
              '' + circle.getAttribute('style') + '; z-index: 100 !important;'
            );
            circle.onmouseover = mouseEvent;
            circle.onmouseleave = mouseEvent;
            const tooltip = tooltipContent(actualColor, region, indicator);
            circle.appendChild(tooltip);
            markerRegion.setContent(circle);
          }
        } else if (isSilence) {
          const markerRegion = regionsPluginRef.current.addRegion({
            start: region.start,
            end: region.end,
            color: actualColor,
            drag: false,
            resize: false,
            channelIdx: region.channel,
            channel: region.channel,
          });
          const duration = Math.round(region.end - region.start);
          const marker = document.createElement('div');
          marker.style.display = 'inline-block';
          marker.style.padding = '0.2em 0.4em';
          marker.style.position = 'relative';
          marker.style.width = '100%';
          marker.style.top = '40%';
          marker.style.textAlign = 'center';
          marker.style.fontSize = '12px';
          marker.style.fontWeight = '600';
          marker.style.color = '#947500';
          marker.innerHTML = duration > 10 ? 'Tạm dừng: ' + duration + 'c' : '';
          markerRegion.setContent(marker);
        } else {
          regionsPluginRef.current.addRegion({
            start: region.start,
            end: region.end,
            color: actualColor,
            drag: false,
            resize: false,
            channelIdx: region.channel,
            channel: region.channel,
          });
        }
      });
    });

    regionsAddedRef.current = true;
  }, [audioIndicators]);

  useEffect(() => {
    if (!containerRef.current || !mediaFileById) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      regionsAddedRef.current = false;
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#0068AD',
      progressColor: '#6B21A8',
      height: hasMultipleChannels ? 48 : 48,
      cursorColor: '#6B21A8',
      splitChannels: hasMultipleChannels
        ? new Array(numChannels).fill({})
        : undefined,
      normalize: true,
      fetchParams: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    wavesurferRef.current = wavesurfer;
    regionsPluginRef.current = wavesurfer.registerPlugin(
      RegionsPlugin.create()
    );

    regionsPluginRef.current.regionsContainer.style.position = 'static';

    if (isDemoMode) {
      // Generate a synthetic speech-like WAV for demo purposes
      const sampleRate = 8000;
      const durationSec = 80;
      const numSamples = sampleRate * durationSec;
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);
      const writeStr = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };
      // WAV header
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 2, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, numSamples * 2, true);
      // Generate speech-like waveform: voiced segments with pauses
      const speechSegments = [
        [0.5, 4.2], [4.3, 6.8], [8.0, 13.5], [14.2, 17.0],
        [17.1, 20.3], [21.5, 23.0], [23.5, 31.5], [32.5, 36.8],
        [37.5, 48.5], [49.5, 54.0], [55.0, 60.0], [60.5, 69.0],
        [70.0, 73.5], [74.0, 76.5],
      ];
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const inSpeech = speechSegments.some(([s, e]) => t >= s && t <= e);
        let sample = 0;
        if (inSpeech) {
          const segStart = speechSegments.find(([s, e]) => t >= s && t <= e)!;
          const segDur = segStart[1] - segStart[0];
          const segPos = (t - segStart[0]) / segDur;
          const env = Math.sin(Math.PI * segPos) * 0.6;
          const f0 = 180 + 40 * Math.sin(2 * Math.PI * 4 * t);
          sample = env * (
            Math.sin(2 * Math.PI * f0 * t) * 0.5 +
            Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25 +
            Math.sin(2 * Math.PI * f0 * 3 * t) * 0.12 +
            (Math.random() - 0.5) * 0.05
          ) * 32767;
        }
        view.setInt16(44 + i * 2, Math.round(sample), true);
      }
      const blob = new Blob([buffer], { type: 'audio/wav' });
      wavesurfer.loadBlob(blob);
    } else {
      const audioUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}api/mediafile/${mediaFileById.id}/stream`;
      fetch(audioUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Lỗi khi tải âm thanh');
          return response.blob();
        })
        .then((blob) => wavesurfer.loadBlob(blob))
        .catch((error) => {
          console.error('Lỗi khi tải âm thanh:', error);
          setIsAudioLoading(false);
        });
    }

    wavesurfer.on('loading', () => {
      setIsAudioLoading(true);
    });

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsAudioLoading(false);
      setWavesurferReady(true);
    });

    wavesurfer.on('audioprocess', () => {
      const time = wavesurfer.getCurrentTime();
      setCurrentTime((prevTime) => {
        if (Math.abs(prevTime - time) > 0.1) return time;
        return prevTime;
      });
    });

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [mediaFileById, hasMultipleChannels, numChannels, isDemoMode, token]);



  useEffect(() => {
    if (wavesurferReady && mediaFileResult && !regionsAddedRef.current) {
      createRegions();
    }
  }, [wavesurferReady, mediaFileResult, createRegions]);

  useEffect(() => {
    if (wavesurferRef.current) {
      const rate = parseFloat(playbackRate.replace('x', ''));
      wavesurferRef.current.setPlaybackRate(rate);
    }
  }, [playbackRate]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '00:00';

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const tabs: TabItem[] = [
    { name: 'Bản ghi lời thoại', key: CallTab.Transcript },
    // { name: 'Tóm tắt', key: CallTab.Summary },
    { name: 'Danh sách kiểm tra', key: CallTab.Checklists },
  ];

  const handleTabChange = (tab: TabItem) => {
    setActiveTab(tab.key as CallTab);
  };

  const callInfo = {
    name: mediaFileById?.operatorName || 'Lindsay Curtis',
    phone:
      mediaFileById?.additionalMetadata?.clientNumber || '+123 (45) 678-91-01',
    date: formatDatesTime(
      mediaFileById?.createDate ? new Date(mediaFileById.createDate) : null
    ),
    duration: `${formatTime(currentTime)} / ${formatTime(duration)}`,
  };

  const generateChecklistData = (): ChecklistGroup[] => {
    const baseGroup = {
      name: 'CÁCH THỨC HỘI THOẠI',
      items: [
        {
          criteriaGroup: 'CÁCH THỨC HỘI THOẠI',
          criteria: 'Tính chính xác của lời chào',
          score: 5,
          maxScore: 5,
          explanation:
            'Điều hành viên đã chào khách hàng đúng cách bằng câu "Chào bạn", giới thiệu tên và tên trung tâm cuộc gọi',
        },
        {
          criteriaGroup: 'CÁCH THỨC HỘI THOẠI',
          criteria: 'Sự lịch sự',
          score: 10,
          maxScore: 10,
          explanation:
            'The operator\'s voice lacked negative intonations. The operator\'s lexicon emphasized a respectful attitude towards the client.',
        },
        {
          criteriaGroup: 'CÁCH THỨC HỘI THOẠI',
          criteria: 'Tính chuẩn mực trong lời nói',
          score: 15,
          maxScore: 15,
          explanation:
            'Điều hành viên không mắc lỗi phát âm hoặc diễn đạt câu',
        },
        {
          criteriaGroup: 'CÁCH THỨC HỘI THOẠI',
          criteria: 'Tính chính xác khi kết thúc cuộc gọi',
          score: 5,
          maxScore: 5,
          explanation:
            'Điều hành viên chúc khách hàng một ngày tốt lành và thể hiện sẵn sàng hỗ trợ trong tương lai',
        },
      ],
      totalScore: 35,
      maxTotalScore: 35,
    };

    const secondGroup = JSON.parse(JSON.stringify(baseGroup));
    return [baseGroup, secondGroup];
  };

  const checklistData = generateChecklistData();
  const playbackRates = ['1x', '1.25x', '1.5x'];

  const summaryContent =
          mediaFileResult?.gptSummary ||
    `Theo tiêu chuẩn hiện đại, nội dung này cần được mô tả thật chi tiết.`;

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <Fragment>
      <PageBreadcrumb
        pageTitle={callInfo.name}
        backTitle="Cuộc gọi"
        backHref={appRoutes.private.calls}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col overflow-y-auto">
        {/* <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium">
              {callInfo.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <>
                <p className="font-medium">{callInfo.name}</p>
                <p className="text-gray-500 text-sm">{callInfo.phone}</p>
              </>
            </div>
          </div>
          <div className="text-gray-500 text-sm">{callInfo.date}</div>
        </div> */}

        <div
          className={`bg-purple-50 rounded-xl p-4 mb-4 relative ${hasMultipleChannels ? 'h-32' : 'h-20'}`}
        >
          {!isAudioLoading && (
            <button
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-purple-200 rounded-full cursor-pointer flex items-center justify-center ${isPlaying ? 'text-purple-700' : ''}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="2"
                    width="4"
                    height="10"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="8"
                    y="2"
                    width="4"
                    height="10"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 2L12 7L3 12V2Z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}

          <div
            className={`wavesurfer-container ml-10 ${hasMultipleChannels ? 'h-24' : 'h-12'}`}
            ref={containerRef}
            id="waveform"
          >
            {isAudioLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600 text-sm">{callInfo.duration}</div>

          <div className="flex gap-5 text-sm">
            {audioIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${indicator.color} mr-2`}
                ></div>
                <span className="text-gray-600">{indicator.type}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {playbackRates.map((rate) => (
              <button
                key={rate}
                className={`text-sm px-2 py-1 rounded cursor-pointer ${
                  playbackRate === rate
                    ? 'text-purple-700 font-medium'
                    : 'text-gray-500'
                }`}
                onClick={() => setPlaybackRate(rate)}
              >
                {rate}
              </button>
            ))}
          </div>
        </div>

        {diarization?.status === 'completed' && (
          <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Xác nhận người nói</h3>
                <p className="mt-1 text-sm text-purple-700">
                  {roleMapping?.suggestion_reason
                    ? `Gợi ý nhân viên dựa trên câu: “${roleMapping.suggestion_reason}”`
                    : 'Chọn người nói là nhân viên để hệ thống chấm regex đúng người.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAgentSpeakerId}
                  onChange={(event) => setSelectedAgentSpeakerId(event.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Chọn người nói</option>
                  {diarization.speakers.map((speaker, index) => (
                    <option key={speaker.speaker_id} value={speaker.speaker_id}>
                      {speaker.role === 'agent'
                        ? 'Nhân viên'
                        : speaker.role === 'customer'
                          ? 'Khách hàng'
                          : `Người nói ${index + 1}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isConfirmingSpeakerRoles || !selectedAgentSpeakerId}
                  onClick={handleConfirmSpeakerRole}
                  className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConfirmingSpeakerRoles ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}

        {diarization && diarization.status !== 'completed' && diarization.status !== 'disabled' && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Chưa thể xác nhận vai trò người nói: {diarization.error?.message ?? diarization.status}.
          </div>
        )}

        <div className="flex items-center justify-start">
          <Tab items={tabs} onChange={handleTabChange} />
        </div>

        <div className="-mx-6">
          <hr className="my-5 border-gray-200" />
        </div>
        {activeTab === CallTab.Summary && <Summary content={summaryContent} />}
        {activeTab === CallTab.Transcript && (
          <Transcript
            summary={summaryContent}
            callInfo={callInfo}
            Stt={mediaFileResult?.stt}
            currentPlayerTime={currentTime}
          />
        )}
        {activeTab === CallTab.Checklists && (
          <Checklist
            checklistData={checklistData}
            gptChecklist={mediaFileResult?.gptChecklist}
          />
        )}
      </div>
    </Fragment>
  );
};
