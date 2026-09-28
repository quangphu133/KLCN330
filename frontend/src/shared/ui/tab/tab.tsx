'use client'

import { useState } from 'react'

type TabItem = {
  name: string
  key: string
}

type TabProps = {
  items: TabItem[]
  onChange?: (tab: TabItem) => void
}

export const Tab = ({ items, onChange }: TabProps) => {
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string>(items[0]?.key || '')

  const handleClick = (tab: TabItem) => {
    setSelectedTaskGroup(tab.key)
    if (onChange) {
      onChange(tab)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex space-x-2 h-[40px] bg-gray-50 dark:bg-gray-800 rounded-full shadow-md">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => handleClick(item)}
            className={`px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out
            ${
              selectedTaskGroup === item.key
                ? 'bg-white text-black font-semibold shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}
