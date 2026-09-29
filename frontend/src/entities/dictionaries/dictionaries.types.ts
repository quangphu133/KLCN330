import { dictionaryColors } from '@/shared/constants/dictionaryColors';

export interface Dictionary {
  id: number;
  name: string | null;
  isActive: boolean;
  type: DictionaryType;
  colorHex: (typeof dictionaryColors)[number];
  data: {
    phrases: string[];
  } | null;
}

export interface DictionaryReqBody {
  name: string;
  isActive: boolean;
  type: DictionaryType;
  colorHex: (typeof dictionaryColors)[number];
  phrases: string[];
}

export const DictionaryTypeValues = [
  'All',
  'OnlyOperator',
  'OnlyClient',
  'Hotwords',
] as const;
export type DictionaryType = (typeof DictionaryTypeValues)[number];

export const DictionariesTranslations = {
  'All': 'Tất cả đối tượng',
  'OnlyOperator': 'Chỉ nhân viên',
  'OnlyClient': 'Chỉ khách hàng',
  'Hotwords': 'Thuật ngữ',
}
