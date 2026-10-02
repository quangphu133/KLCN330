export type SortKey = 
  | 'date'
  | 'phone'
  | 'duration'
  | 'negative'
  | 'lexis'
  | 'interruptions'
  | 'silence'
;

export const getSortParamName = (
  key: SortKey,
  direction: 'asc' | 'desc'
): string | null => {
  const map: Record<SortKey, string> = {
    date: 'CreateDate',
    phone: 'ClientNumber',
    duration: 'Duration',
    negative: 'NegativeLevel',
    lexis: 'PhrasesCount',
    interruptions: 'SimultaneousSpeechCount',
    silence: 'MaxSimultaneousSilence',
  };

  const suffix = map[key];
  if (!suffix) return null;

  return `orderBy${direction === 'desc' ? 'Desc' : ''}${suffix}`;
};
