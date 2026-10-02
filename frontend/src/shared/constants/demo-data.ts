// Ghi chú nhóm: Cập nhật giao diện và nội dung tiếng Việt cho khu vực này.
import type { AnalyticsDashboardResponse } from '@/entities/analytics/analytics.types'
import type { Checklist } from '@/entities/checklists/checklists.types'
import type { Dictionary } from '@/entities/dictionaries/dictionaries.types'
import type { MediaFileResponse } from '@/entities/mediafile/api/mediafile.types'
import type { Project } from '@/entities/projects/projects.types'

export const demoProjects: Project[] = [
  { id: 1, name: 'Chăm sóc khách hàng', isActive: true },
  { id: 2, name: 'Tư vấn bán hàng', isActive: true },
  { id: 3, name: 'Đánh giá chất lượng', isActive: false },
]

const demoChecklistData = {
  name: 'Bộ tiêu chí đánh giá cuộc gọi',
  minScore: 0,
  maxScore: 10,
  score: null,
  blocks: [
    {
      name: 'Quy trình hội thoại',
      minScore: 0,
      maxScore: 10,
      score: null,
      criterias: [
        {
          name: 'Chào hỏi chuyên nghiệp',
          minScore: 0,
          maxScore: 2,
          score: null,
          help: 'Nhân viên chào khách hàng và giới thiệu bản thân theo đúng mẫu.',
          comment: null,
          scale: 'Full' as const,
        },
        {
          name: 'Giải đáp rõ ràng',
          minScore: 0,
          maxScore: 8,
          score: null,
          help: 'Nhân viên giải quyết yêu cầu của khách hàng một cách chính xác.',
          comment: null,
          scale: 'Full' as const,
        },
      ],
    },
  ],
}

export const demoChecklists: Checklist[] = [
  { id: 1, name: 'Bộ tiêu chí đánh giá cuộc gọi', isActive: true, data: demoChecklistData, projectIds: [1, 2] },
  { id: 2, name: 'Bộ tiêu chí bán hàng qua điện thoại', isActive: true, data: demoChecklistData, projectIds: [2] },
]

export const demoDictionaries: Dictionary[] = [
  { id: 1, name: 'Cụm từ chào hỏi', isActive: true, type: 'All', colorHex: '#88c289', data: { phrases: ['xin chào', 'chào anh chị', 'kính chào'] } },
  { id: 2, name: 'Từ khóa sản phẩm & dịch vụ', isActive: true, type: 'OnlyOperator', colorHex: '#639fe5', data: { phrases: ['giá', 'gói dịch vụ', 'nâng cấp', 'khuyến mãi'] } },
]

const demoMediaFile = {
  projectName: 'Chăm sóc khách hàng',
  gptChecklist: null,
  gptSummary: 'Nhân viên đã tiếp nhận và giải quyết yêu cầu nâng cấp gói dịch vụ của khách hàng một cách chuyên nghiệp.',
  id: 1001,
  fileName: 'cuoc-goi-cskh-001.wav',
  totalCount: 3,
  numChannels: 2,
  sampleRate: 44100,
  duration: 187,
  telesaleId: 1,
  telesaleName: 'Nguyễn Văn An',
  operatorChannel: '1',
  lastAccessUtc: '2026-09-14T08:30:00.000Z',
  createDate: '2026-09-14T08:30:00.000Z',
  isFailed: false,
  additionalMetadata: { outerId: 'demo-001', clientId: 'client-001', clientNumber: '0988 123 456', direction: 'Inbound' },
  summaryAnalyserResult: {
    simultaneousSpeechCount: 2,
    simultaneousSilenceCount: 1,
    maxSimultaneousSpeechDuration: 2.4,
    maxSimultaneousSilenceDuration: 4.2,
    averageSimultaneousSpeechDuration: 1.2,
    averageSimultaneousSilenceDuration: 2.1,
    keywordsSearchCounter: { 'xin chào': 2, 'gói dịch vụ': 1 },
    totalSpeechOverall: 150,
    totalNonSpeechOverall: 37,
    negativeLevelOverall: 0.12,
    totalSpeechDurationOperator: 80,
    totalNonSpeechDurationOperator: 17,
    negativeSpeechWeightedDurationOperator: 4,
    negativeLevelOperator: 0.1,
    totalSpeechDurationClient: 70,
    totalNonSpeechDurationClient: 20,
    negativeSpeechWeightedDurationClient: 5,
    negativeLevelClient: 0.14,
  },
  filteredKeywordsCount: 3,
}

export const demoMediaFiles: MediaFileResponse = {
  totalCount: 3,
  mediaFile: [
    demoMediaFile,
    { ...demoMediaFile, id: 1002, fileName: 'cuoc-goi-ban-hang-014.wav', projectName: 'Tư vấn bán hàng', telesaleId: 2, telesaleName: 'Trần Thị Bình', additionalMetadata: { ...demoMediaFile.additionalMetadata, clientNumber: '0912 345 678' } },
    { ...demoMediaFile, id: 1003, fileName: 'cuoc-goi-danh-gia-007.wav', projectName: 'Đánh giá chất lượng', telesaleId: 3, telesaleName: 'Lê Hoàng Cường', additionalMetadata: { ...demoMediaFile.additionalMetadata, clientNumber: '0903 888 999' } },
  ],
}

export const demoAnalytics: AnalyticsDashboardResponse = {
  keywordsFrequencyData: { 'xin chào': 18, 'gói dịch vụ': 12, 'giá': 9, 'kính chào': 7, 'nâng cấp': 5 } as any,
  messageText: 'Dữ liệu phân tích báo cáo',
  plotData: [
    { dateTime: '2026-09-10', keywordsExceedCount: 4, maxSilenceDurationExceedCount: 2, negativeLevelExceedCount: 3, simultaneousSpeechExceedCount: 1 },
    { dateTime: '2026-09-11', keywordsExceedCount: 6, maxSilenceDurationExceedCount: 3, negativeLevelExceedCount: 2, simultaneousSpeechExceedCount: 2 },
    { dateTime: '2026-09-12', keywordsExceedCount: 5, maxSilenceDurationExceedCount: 1, negativeLevelExceedCount: 4, simultaneousSpeechExceedCount: 3 },
    { dateTime: '2026-09-13', keywordsExceedCount: 8, maxSilenceDurationExceedCount: 2, negativeLevelExceedCount: 3, simultaneousSpeechExceedCount: 2 },
  ],
  negativeHistogramData: { '0.1': 8, '0.2': 14, '0.3': 7, '0.4': 3 },
  summaryData: { recordsCount: 128, averageDuration: 214, averageNegativeLevelOverall: 0.16, averageKeywordsCount: 2.8, averageMaxSimultaneousSilenceDuration: 3.1, averageSimultaneousSpeechCount: 1.7 },
  employeeRatingData: [
    { telesaleId: 1, telesaleName: 'Nguyễn Văn An', recordsCount: 52, averageDuration: 198, averageNegativeLevelOverall: 0.11, averageKeywordsCount: 2.1, averageMaxSimultaneousSilenceDuration: 2.4, averageSimultaneousSpeechCount: 1.2 },
    { telesaleId: 2, telesaleName: 'Trần Thị Bình', recordsCount: 44, averageDuration: 226, averageNegativeLevelOverall: 0.17, averageKeywordsCount: 3.2, averageMaxSimultaneousSilenceDuration: 3.5, averageSimultaneousSpeechCount: 1.8 },
    { telesaleId: 3, telesaleName: 'Lê Hoàng Cường', recordsCount: 32, averageDuration: 219, averageNegativeLevelOverall: 0.2, averageKeywordsCount: 3.1, averageMaxSimultaneousSilenceDuration: 3.7, averageSimultaneousSpeechCount: 2.1 },
  ],
}

export const demoMediaFileResult: any = {
  gptSummary: 'Khách hàng gọi điện tìm hiểu về việc nâng cấp gói dịch vụ hiện tại. Nhân viên tổng đài Nguyễn Văn An đã tư vấn nhiệt tình, cung cấp đầy đủ thông tin về các gói dịch vụ và thực hiện nâng cấp thành công cho khách hàng.',
  gptChecklist: null,
  stt: {
    text: 'Dạ xin chào anh chị, cảm ơn anh chị đã gọi đến tổng đài Chăm sóc khách hàng. Em là An, em có thể hỗ trợ gì cho anh chị ạ? Chào An, anh muốn tìm hiểu về việc nâng cấp gói dịch vụ hiện tại. Dạ vâng ạ! Em rất sẵn lòng hỗ trợ anh. Anh cho em xin số tài khoản hoặc số hợp đồng được không ạ? Được chứ, số hợp đồng của anh là 4521. Dạ em cảm ơn anh. Em thấy gói hiện tại của anh là gói Cơ bản. Bên em đang có gói Tiêu chuẩn và Cao cấp ạ. Anh quan tâm nhất đến tính năng nào ạ? Anh cần dung lượng lưu trữ nhiều hơn và hỗ trợ ưu tiên. Dạ trong trường hợp đó gói Cao cấp rất phù hợp với anh ạ. Gói bao gồm 100GB dung lượng và hỗ trợ ưu tiên 24/7. Giá cước như thế nào em? Dạ cước phí là 490.000 đồng một tháng ạ. Anh thấy cước phí đó hợp lý. Em làm thủ tục nâng cấp cho anh nhé? Dạ vâng em sẽ tiến hành nâng cấp ngay cho anh ạ. Anh sẽ nhận được email xác nhận trong ít phút tới. Anh còn cần hỗ trợ thêm thông tin gì khác nữa không ạ? Không anh cảm ơn An nhé. Dạ em cảm ơn anh, chúc anh một ngày tốt lành ạ!',
    chunks: [
      { channel: 1, startChar: 0, endChar: 62, startTime: 0.5, endTime: 4.2, text: 'Dạ xin chào anh chị, cảm ơn anh chị đã gọi đến tổng đài Chăm sóc khách hàng.', regions: [] },
      { channel: 1, startChar: 63, endChar: 110, startTime: 4.3, endTime: 6.8, text: 'Em là An, em có thể hỗ trợ gì cho anh chị ạ?', regions: [] },
      { channel: 0, startChar: 111, endChar: 178, startTime: 8.0, endTime: 13.5, text: 'Chào An, anh muốn tìm hiểu về việc nâng cấp gói dịch vụ hiện tại.', regions: [] },
      { channel: 1, startChar: 179, endChar: 220, startTime: 14.2, endTime: 17.0, text: 'Dạ vâng ạ! Em rất sẵn lòng hỗ trợ anh.', regions: [] },
      { channel: 1, startChar: 221, endChar: 274, startTime: 17.1, endTime: 20.3, text: 'Anh cho em xin số tài khoản hoặc số hợp đồng được không ạ?', regions: [] },
      { channel: 0, startChar: 275, endChar: 297, startTime: 21.5, endTime: 23.0, text: 'Được chứ, số hợp đồng của anh là 4521.', regions: [] },
      { channel: 1, startChar: 298, endChar: 360, startTime: 23.5, endTime: 28.0, text: 'Dạ em cảm ơn anh. Em thấy gói hiện tại của anh là gói Cơ bản. Bên em đang có gói Tiêu chuẩn và Cao cấp ạ.', regions: [] },
      { channel: 1, startChar: 361, endChar: 406, startTime: 28.1, endTime: 31.5, text: 'Anh quan tâm nhất đến tính năng nào ạ?', regions: [] },
      { channel: 0, startChar: 407, endChar: 462, startTime: 32.5, endTime: 36.8, text: 'Anh cần dung lượng lưu trữ nhiều hơn và hỗ trợ ưu tiên.', regions: [] },
      { channel: 1, startChar: 463, endChar: 540, startTime: 37.5, endTime: 43.0, text: 'Dạ trong trường hợp đó gói Cao cấp rất phù hợp với anh ạ.', regions: [] },
      { channel: 1, startChar: 541, endChar: 610, startTime: 43.1, endTime: 48.5, text: 'Gói bao gồm 100GB dung lượng và hỗ trợ ưu tiên 24/7.', regions: [] },
      { channel: 0, startChar: 611, endChar: 640, startTime: 49.5, endTime: 51.2, text: 'Giá cước như thế nào em?', regions: [] },
      { channel: 1, startChar: 641, endChar: 680, startTime: 51.8, endTime: 54.0, text: 'Dạ cước phí là 490.000 đồng một tháng ạ.', regions: [] },
      { channel: 0, startChar: 681, endChar: 742, startTime: 55.0, endTime: 58.5, text: 'Anh thấy cước phí đó hợp lý. Em làm thủ tục nâng cấp cho anh nhé?', regions: [] },
      { channel: 1, startChar: 743, endChar: 754, startTime: 59.0, endTime: 60.0, text: 'Dạ vâng em sẽ tiến hành nâng cấp ngay cho anh ạ.', regions: [] },
      { channel: 1, startChar: 755, endChar: 830, startTime: 60.5, endTime: 66.0, text: 'Anh sẽ nhận được email xác nhận trong ít phút tới.', regions: [] },
      { channel: 1, startChar: 831, endChar: 880, startTime: 66.1, endTime: 69.0, text: 'Anh còn cần hỗ trợ thêm thông tin gì khác nữa không ạ?', regions: [] },
      { channel: 0, startChar: 881, endChar: 930, startTime: 70.0, endTime: 73.5, text: 'Không anh cảm ơn An nhé.', regions: [] },
      { channel: 1, startChar: 931, endChar: 975, startTime: 74.0, endTime: 76.5, text: 'Dạ em cảm ơn anh, chúc anh một ngày tốt lành ạ!', regions: [] },
    ],
    regions: []
  },
  tonal: {
    regions: [
      { prob: 0.72, type: 1, startTime: 32.5, endTime: 36.8, channel: 0 },
    ]
  },
  simultaneousSpeech: { regions: [] },
  simultaneousSilence: {
    regions: [
      { startTime: 6.9, endTime: 7.9 },
      { startTime: 13.6, endTime: 14.1 },
      { startTime: 23.1, endTime: 23.4 },
    ]
  },
  keywordsSearchResult: {
    regions: [
      { category: 1, categoryName: 'Từ khóa sản phẩm & dịch vụ', phrase: 'gói dịch vụ', startChar: 148, endChar: 160, startTime: 11.0, endTime: 13.0, channel: 0 },
      { category: 1, categoryName: 'Từ khóa sản phẩm & dịch vụ', phrase: 'nâng cấp', startChar: 487, endChar: 494, startTime: 38.5, endTime: 40.0, channel: 1 },
      { category: 1, categoryName: 'Từ khóa sản phẩm & dịch vụ', phrase: 'nâng cấp', startChar: 703, endChar: 710, startTime: 57.0, endTime: 58.5, channel: 0 },
    ]
  }
};
