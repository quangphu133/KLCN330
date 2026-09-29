'use client'

import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useTheme } from '@/shared/context/theme-context/theme-context'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface NegativeHistogramChartProps {
  data?: Record<string, number>
}

export default function AnalyticsBarChart({ data }: NegativeHistogramChartProps) {
  const { theme } = useTheme()
  const { categories, values, colors } = useMemo(() => {
    if (!data) {
      return { categories: [], values: [], colors: [] }
    }

    const sortedEntries = Object.entries(data).sort((a, b) => {
      return parseFloat(a[0]) - parseFloat(b[0])
    })

    const categories = sortedEntries.map(([key]) => {
      const value = parseFloat(key)
      const start = Math.floor(value * 100)
      const end = Math.floor((value + 0.1) * 100)
      return `${start}-${end}%`
    })

    const values = sortedEntries.map(([_, value]) => value)

    const lastIndex = values.length - 1

    const colors = categories.map((_, index) => {
      if (index === lastIndex) {
        return '#5a2d76'
      }
        return theme === 'dark' ? '#374151' : '#F2F2F7'
    })

    return { categories, values, colors }
  }, [data, theme])

  const options: ApexOptions = {
    theme: { mode: theme },
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    colors: colors,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 4,
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
    grid: {
      show: true,
      borderColor: theme === 'dark' ? '#374151' : '#F2F2F7',
      strokeDashArray: 4,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: theme === 'dark' ? '#9CA3AF' : '#8E8E93',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    yaxis: {
      min: 0,
      max: max => Math.ceil(max / 200) * 200,
      tickAmount: 4,
      labels: {
        style: {
          colors: theme === 'dark' ? '#9CA3AF' : '#8E8E93',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
        formatter: value => Math.round(value).toString(),
      },
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: true,
      theme,
      y: {
        formatter: val => val.toString(),
      },
    },
  }

  const series = [
    {
      name: 'Tiêu cực',
      data: values,
    },
  ]

  return (
    <div
      className="rounded-2xl h-full border border-gray-100 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:pt-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-gray-100">Tần suất</h3>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-full">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  )
}
