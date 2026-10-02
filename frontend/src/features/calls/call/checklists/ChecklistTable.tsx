// Ghi chú nhóm: Cải thiện độ tương phản chế độ tối cho nội dung cuộc gọi và transcript.
import { GptChecklist } from '@/entities/mediafile/api/mediafile.types';
import { Fragment } from 'react';

interface Props {
  checklist: GptChecklist | null;
}

export const ChecklistTable = ({ checklist }: Props) => {
  return checklist?.collection
    .filter(
      (checklistItem) => checklistItem.blocks && checklistItem.blocks.length > 0
    )
    .map((checklistItem, checklistIndex) => (
      <Fragment key={checklistIndex}>
        <h3 className="font-semibold text-gray-900 text-lg mb-4 dark:text-gray-100">
          {checklistItem.name}
        </h3>
        <div
          key={checklistIndex}
          className="bg-gray-200 rounded-lg overflow-hidden grid gap-px border border-gray-200 dark:bg-gray-700 dark:border-gray-700"
          style={{
            gridTemplateColumns: '1fr 1fr auto 2fr',
          }}
        >
          {['Nhóm tiêu chí', 'Tiêu chí', 'Điểm', 'Giải thích'].map((el) => (
            <div
              key={el}
              className="py-4 px-6 text-left text-sm font-medium text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400"
            >
              {el}
            </div>
          ))}
          {checklistItem.blocks
            .filter((block) => block.criterias && block.criterias.length > 0)
            .map((block, itemIndex) => {
              const rowClass = `row-span-${block.criterias.length}`;
              return (
                <Fragment key={itemIndex}>
                  <div
                    className={`py-4 px-6 flex items-center text-sm font-semibold text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-100 ${rowClass}`}
                  >
                    {block.name ?? ' - '}
                  </div>
                  {block.criterias.map((criteria, index) => (
                    <Fragment key={index}>
                      <div className="flex items-center px-6 py-4 justify-betwwen w-full bg-white dark:bg-gray-900">
                        <div className="grow">{criteria.name ?? ' - '}</div>
                      </div>

                      <div className="flex items-center py-4 px-2 bg-white justify-center dark:bg-gray-900">
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                              criteria.score === criteria.maxScore
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                : criteria.score &&
                                    criteria.score > criteria.maxScore / 2
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            } `}
                        >
                          {criteria.score ?? '—'}
                        </div>
                      </div>
                      <div
                        key={index}
                        className="px-4 py-2 bg-white flex items-center dark:bg-gray-900 dark:text-gray-300"
                      >
                        {criteria.comment}
                      </div>
                    </Fragment>
                  ))}

                  <div
                    className="bg-white dark:bg-gray-900 dark:text-gray-100 col-span-2 uppercase py-4 px-6 flex items-center justify-center text-sm font-semibold text-gray-900"
                  >
                    Tổng điểm: {block.name ?? ' - '}
                  </div>
                  <div className="bg-white flex items-center px-4 py-6 justify-center dark:bg-gray-900 dark:text-gray-300">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                        block.score === block.maxScore
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : block.score && block.score > block.maxScore / 2
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      } `}
                    >
                      {block.score}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900"></div>
                </Fragment>
              );
            })}
          <div
            className="bg-white dark:bg-gray-900 dark:text-gray-100 col-span-2 uppercase py-4 px-6 flex items-center justify-center text-sm font-semibold text-gray-900"
          >
            Tổng theo danh sách kiểm tra
          </div>
          <div className="flex items-center px-4 py-6 bg-white justify-center dark:bg-gray-900 dark:text-gray-300">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                checklistItem.score === checklistItem.maxScore
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  : checklistItem.score &&
                      checklistItem.score > checklistItem.maxScore / 2
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
              } `}
            >
              {checklistItem.score}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900"></div>
        </div>
      </Fragment>
    ));
};
