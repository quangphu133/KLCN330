import React, { useState, useMemo, useEffect } from 'react';
import { DropdownCustom } from '@/shared/ui/dropdown-custom';

interface ChecklistSummaryProps {
  checklist: {
    collection?: {
      blocks?: {
        criterias?: {
          name: string | null;
          minScore: number;
          maxScore: number;
          score: number;
          comment: string;
          help: string | null;
        }[];
        maxScore: number;
        minScore: number;
        score: number;
        name: string;
      }[];
      maxScore: number;
      minScore: number;
      name?: string;
      score: number;
      topic?: string | null;
    }[];
  };
  defaultMaxScore?: number;
}

export const ChecklistSummary: React.FC<ChecklistSummaryProps> = ({
  checklist,
}) => {
  const { collection } = checklist;
  const [selectedCheckList, setSelectedCheckList] = useState(collection?.[0]);
  const [checkListPercentage, setCheckListPercentage] = useState(0);

  useEffect(() => {
    const data = collection?.[0] || { maxScore: 0, score: 0 };
    const percentage =
      data.maxScore > 0 ? (data.score / data.maxScore || 1) * 100 : 0;
    setCheckListPercentage(percentage);
  }, [collection]);

  const checkListsOptions = useMemo(() => {
    return (
      collection?.map((checklist, index) => ({
        label: checklist.name || '-',
        value: index.toString(),
      })) || []
    );
  }, [collection]);

  const handleChange = (val: string) => {
    const selectedIndex = parseInt(val, 10);
    if (collection && selectedIndex >= 0 && selectedIndex < collection.length) {
      const selectedList = collection
        ? collection[selectedIndex]
        : { maxScore: 0, score: 0, minScore: 0 };
      setSelectedCheckList(selectedList);
      const percentage =
        selectedList?.maxScore > 0
          ? (selectedList.score / selectedList.maxScore) * 100
          : 0;
      setCheckListPercentage(percentage);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percent = (score / maxScore) * 100;
    if (percent >= 80) return 'bg-green-100 text-green-800';
    if (percent >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!checklist || !collection || collection.length === 0) {
    return <div>No checklists available.</div>;
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex justify-between p-5">
        <div>
          <DropdownCustom
            label="Checklist"
            placeholder="Select checklist"
            onChange={handleChange}
            selected={{
              label: selectedCheckList?.name || '',
              value: selectedCheckList?.name || '',
            }}
            options={checkListsOptions}
          />
          {/* <Select
            label="Checklist"
            placeholder="Select checklist"
            onChange={handleChange}
            options={checkListsOptions}
          /> */}
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="mr-3 font-medium text-sm">
              Overall checklist score: {selectedCheckList?.score}/
              {selectedCheckList?.maxScore}
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  checkListPercentage >= 80
                    ? 'bg-green-500'
                    : checkListPercentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${checkListPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {selectedCheckList?.blocks?.map((block, index) => {
        const scorePercentage =
          block.maxScore > 0 ? (block.score / block.maxScore) * 100 : 0;
        return (
          <div key={index}>
            <div className="bg-purple-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-purple-800">
                  {block.name || 'Tóm tắt danh sách kiểm tra'}
                </h3>
                <div className="flex items-center">
                  <div className="mr-3 font-medium text-sm">
                    Tổng điểm: {block.score}/{block.maxScore}
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        scorePercentage >= 80
                          ? 'bg-green-500'
                          : scorePercentage >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {block.criterias?.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded p-3 bg-white"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(item.score, item.maxScore)}`}
                    >
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="text-xs text-gray-500">{item.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
