'use client'

import { useState, useEffect } from 'react'
import Button from '@/shared/ui/button/button'
import { Modal } from '@/shared/ui/modal/modal'
import { useGetDictionariesQuery } from '@/entities/dictionaries/dictionaries.api'
import Checkbox from '@/shared/ui/checkbox/checkbox'
import { formatEndDate, formatStartDate } from '@/shared/utils/date-utils'
import { DateTimePicker } from '@/shared/ui/date-picker/date-picker'

interface DateRange {
  start: string
  end: string
}

interface AnalyticsFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (params: {
    start: string
    end: string
    filterByPhrasesCategoriesCommaSeparated?: string
  }) => void
  storagePrefix: string
  filtersReset?: boolean
}

export const AnalyticsFilterModal = ({
  isOpen,
  onClose,
  onApply,
  storagePrefix,
  filtersReset,
}: AnalyticsFilterModalProps) => {
  const { data: vocabularyData } = useGetDictionariesQuery()
  const [selectedDictionaries, setSelectedDictionaries] = useState<number[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    if (vocabularyData) {
      setSelectedDictionaries([])
    }
  }, [vocabularyData])

  useEffect(() => {
    if (filtersReset) {
      setSelectedDictionaries([])
      setDateRange(undefined)
    }
  }, [filtersReset])

  useEffect(() => {
    if (isOpen) {
      const storedStart = localStorage.getItem(`${storagePrefix}_filter-start`)
      const storedEnd = localStorage.getItem(`${storagePrefix}_filter-end`)
      const storedCategories = localStorage.getItem(
        `${storagePrefix}_filter-filterByPhrasesCategoriesCommaSeparated`
      )

      if (storedStart && storedEnd) {
        setDateRange({
          start: storedStart,
          end: storedEnd,
        })
      }

      if (storedCategories) {
        setSelectedDictionaries(storedCategories.split(',').map(str => Number(str)))
      }
    }
  }, [isOpen, storagePrefix])

  const handleDictionaryChange = (dictionaryId: number): void => {
    setSelectedDictionaries(prev =>
      prev.includes(dictionaryId) ? prev.filter(id => id !== dictionaryId) : [...prev, dictionaryId]
    )
  }

  const isDateRangeValid = () => {
    return dateRange && dateRange.start && dateRange.end
  }

  const hasAnyFiltersSelected = () => {
    return isDateRangeValid() || selectedDictionaries.length > 0
  }

  const handleApply = () => {
    if (!hasAnyFiltersSelected()) {
      return
    }

    const params: {
      start: string
      end: string
      filterByPhrasesCategoriesCommaSeparated?: string
    } = {
      start: dateRange?.start ?? '',
      end: dateRange?.end ?? '',
    }

    if (selectedDictionaries.length > 0) {
      params.filterByPhrasesCategoriesCommaSeparated = selectedDictionaries.join(',')
    }

    onApply(params)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title={'Bộ lọc'} onClose={onClose} className="max-w-[410px] mx-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2">Chọn khoảng thời gian</h3>
        <DateTimePicker
          value={dateRange ? [new Date(dateRange.start), new Date(dateRange.end)] : null}
          onChange={value => {
            if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
              const [start, end] = value
              setDateRange({
                start: formatStartDate(start)!,
                end: formatEndDate(end)!,
              })
            } else {
              setDateRange(undefined)
            }
          }}
          withTime={false}
          range={true}
        />
        <h3 className="text-sm font-semibold mt-4 mb-2">Từ điển</h3>
        <div className="space-y-2">
          {vocabularyData &&
            Object.entries(vocabularyData).map(([id, name]) => (
              <div key={id} className="flex items-center">
                <Checkbox
                  id={`dictionary-${id}`}
                  checked={selectedDictionaries.includes(Number(id))}
                  onChange={() => handleDictionaryChange(Number(id))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor={`dictionary-${id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {name.name}
                </label>
              </div>
            ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            className={`px-2 py-2 ${
              hasAnyFiltersSelected()
                ? 'bg-purple-900 cursor-pointer hover:bg-purple-800'
                : 'bg-purple-300 cursor-not-allowed'
            } text-white rounded-full`}
            onClick={handleApply}
            disabled={!hasAnyFiltersSelected()}
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AnalyticsFilterModal
