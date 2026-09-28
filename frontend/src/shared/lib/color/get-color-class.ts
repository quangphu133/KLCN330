export const getNegativeColorClass = (negativePercentage: number): string => {
  if (negativePercentage >= 50) return 'text-red-500'
  if (negativePercentage >= 40) return 'text-orange-500'
  if (negativePercentage >= 30) return 'text-yellow-500'
  if (negativePercentage >= 10) return 'text-green-500'
  return 'text-gray-500'
}

export const getValueColorClass = (value: number): string => {
  if (value >= 10) return 'text-red-500'
  if (value >= 7) return 'text-orange-500'
  if (value >= 4) return 'text-yellow-500'
  if (value >= 1) return 'text-green-500'
  return 'text-gray-500'
}

export const getSilenceColorClass = (seconds: number): string => {
  if (seconds >= 60) return 'text-red-500'
  if (seconds >= 30) return 'text-orange-500'
  if (seconds >= 15) return 'text-yellow-500'
  if (seconds > 0) return 'text-green-500'
  return 'text-gray-500'
}
