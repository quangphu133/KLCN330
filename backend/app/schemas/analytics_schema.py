from pydantic import BaseModel
from typing import Dict, List, Optional, Any


class SummaryData(BaseModel):
    recordsCount: int
    averageDuration: float
    averageNegativeLevelOverall: Optional[float]
    averageKeywordsCount: float
    averageMaxSimultaneousSilenceDuration: float
    averageSimultaneousSpeechCount: float


class PlotDataItem(BaseModel):
    dateTime: str
    keywordsExceedCount: int
    maxSilenceDurationExceedCount: int
    negativeLevelExceedCount: int
    simultaneousSpeechExceedCount: int


class OperatorRatingDataItem(BaseModel):
    operatorName: Optional[str]
    recordsCount: int
    averageDuration: float
    averageNegativeLevelOverall: Optional[float]
    averageKeywordsCount: float
    averageMaxSimultaneousSilenceDuration: float
    averageSimultaneousSpeechCount: float


class AnalyticsDashboardResponse(BaseModel):
    keywordsFrequencyData: Any
    messageText: str
    plotData: List[PlotDataItem]
    negativeHistogramData: Dict[str, int]
    summaryData: SummaryData
    operatorRatingData: List[OperatorRatingDataItem]
