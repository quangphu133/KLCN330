'use client'

import React, { Fragment } from 'react'
// import { ChecklistTóm tắt } from './checklist-summary'
import { ChecklistTable } from './ChecklistTable'

type ChecklistItem = {
  criteriaGroup: string
  criteria: string
  score: number
  maxScore: number
  explanation: string
}

export type ChecklistGroup = {
  name: string
  items: ChecklistItem[]
  totalScore?: number
  maxTotalScore?: number
}

interface ChecklistProps {
  checklistData: ChecklistGroup[]
  gptChecklist?: any | null
}

export const Checklist: React.FC<ChecklistProps> = ({ checklistData, gptChecklist }) => {
  return gptChecklist ? <div className="text-gray-700 space-y-8 dark:text-gray-300">
    <ChecklistTable checklist={gptChecklist} />
    {/* <ChecklistTóm tắt checklist={gptChecklist} /> */}
  </div> : null;
}
