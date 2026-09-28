import { GptChecklist } from '@/entities/mediafile/api/mediafile.types';
import { Fragment, useState } from 'react';
// import { EditIcon } from '../../../../../public/assets/icons';
import type { Block, Criteria } from '@/entities/checklists/checklists.types';
import Label from '@/shared/ui/label/label';
import { useUpdateChecklistMutation } from '@/entities/checklists/checklists.api';
import { useUpdateMediaFileChecklistMutation } from '@/entities/mediafile/api/mediafile.api';
import { useParams } from 'next/navigation';

interface Props {
  checklist: GptChecklist | null;
}

export const ChecklistTable = ({ checklist }: Props) => {
  const [curBlock, setCurBlock] = useState<Block | null>(null);
  const [curCriteria, setCurCriteria] = useState<Criteria | null>(null);
  const [isEditingNumber, setIsEditingNumber] = useState<boolean>(false);
  const [curInputValue, setCurInputValue] = useState<number | undefined>(
    undefined
  );

  const params = useParams();
  const medifileId = Number(params.id);

  const [updateMediafileChecklist, updateMediafileChecklistResult] =
    useUpdateMediaFileChecklistMutation();

  return checklist?.collection
    .filter(
      (checklistItem) => checklistItem.blocks && checklistItem.blocks.length > 0
    )
    .map((checklistItem, checklistIndex) => (
      <Fragment key={checklistIndex}>
        <h3 className="font-semibold text-gray-900 text-lg mb-4">
          {checklistItem.name}
        </h3>
        <div
          key={checklistIndex}
          className="bg-gray-200 rounded-lg overflow-hidden grid gap-px border border-gray-200"
          style={{
            gridTemplateColumns: '1fr 1fr auto 2fr',
          }}
        >
          {['Criteria group', 'Tiêu chí', 'Score', 'Explanation'].map((el) => (
            <div
              key={el}
              className="py-4 px-6 text-left text-sm font-medium text-gray-500 bg-white"
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
                    className={`py-4 px-6 flex items-center text-sm font-semibold text-gray-900 bg-white ${rowClass}`}
                  >
                    {block.name ?? ' - '}
                  </div>
                  {block.criterias.map((criteria, index) => (
                    <Fragment key={index}>
                      <div className="flex items-center px-6 py-4  justify-betwwen w-full bg-white">
                        <div className="grow">{criteria.name ?? ' - '}</div>
                        {/* <div
                          className={`w-8 h-8 shrink-0 cursor-pointer rounded-full hover:bg-purple-100 
                            transition duration-300 p-2 ${
                              isEditingNumber &&
                              curBlock &&
                              curCriteria &&
                              block.name === curBlock.name &&
                              criteria.name === curCriteria.name &&
                              'bg-purple-100'
                            }`}
                          onClick={() => {
                            setCurBlock(() => block);
                            setCurCriteria(() => criteria);

                            const isBlockSelected = curBlock && curCriteria;

                            const isCurrentBlock =
                              isBlockSelected &&
                              block.name === curBlock.name &&
                              criteria.name === curCriteria.name;

                            if (!isBlockSelected) {
                              setIsEditingNumber(() => true);
                            }

                            if (!isCurrentBlock && isEditingNumber === false) {
                              setIsEditingNumber(() => true);
                            }

                            if (isCurrentBlock && isEditingNumber === true) {
                              setIsEditingNumber(() => false);

                              const newBlocks = checklistItem.blocks.map(
                                (bl) => {
                                  if (bl.name !== curBlock.name) return bl;

                                  const updatedCriterias = bl.criterias.map(
                                    (cr) => {
                                      if (cr.name !== curCriteria.name)
                                        return cr;

                                      return {
                                        ...cr,
                                        score: curInputValue ?? null,
                                      };
                                    }
                                  );

                                  return {
                                    ...bl,
                                    criterias: updatedCriterias,
                                  };
                                }
                              );

                              updateMediafileChecklist({
                                id: medifileId,
                                body: {
                                  blocks: newBlocks,
                                },
                                checklistId: checklistItem.id ?? 0,
                              });
                            }
                          }}
                        >
                          <EditIcon />
                        </div> */}
                      </div>

                      <div className="flex items-center py-4 px-2 bg-white justify-center">
                        {isEditingNumber &&
                        curBlock &&
                        curCriteria &&
                        block.name === curBlock.name &&
                        criteria.name === curCriteria.name ? (
                          <Fragment>
                            {curCriteria.scale === 'Full' && (
                              <div className="flex flex-col gap-2">
                                <input
                                  min={criteria.minScore}
                                  max={criteria.maxScore}
                                  step={1}
                                  type="range"
                                  className="transform duration-300 w-18"
                                  onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    const newValue = parseInt(target.value);
                                    setCurInputValue(() => newValue);
                                  }}
                                  value={curInputValue}
                                />
                                <div className="flex justify-between w-full">
                                  <div>{criteria.minScore}</div>
                                  <div>{criteria.maxScore}</div>
                                </div>
                              </div>
                            )}
                            {curCriteria.scale === 'Binary' && (
                              <div className="flex gap-2 w-full justify-between">
                                <div className="flex flex-col items-center">
                                  <input
                                    type="radio"
                                    id="min"
                                    name="binary"
                                    value={criteria.minScore}
                                    onChange={() => {
                                      setCurInputValue(() => criteria.minScore);
                                    }}
                                    checked={criteria.minScore == curInputValue}
                                  />
                                  <Label>{criteria.minScore}</Label>
                                </div>

                                <div className="flex flex-col items-center">
                                  <input
                                    type="radio"
                                    id="max"
                                    name="binary"
                                    value={criteria.maxScore}
                                      checked={criteria.maxScore == curInputValue}
                                    onChange={() => {
                                      setCurInputValue(() => criteria.maxScore);
                                    }}
                                  />
                                  <Label>{criteria.maxScore}</Label>
                                </div>
                              </div>
                            )}
                          </Fragment>
                        ) : (
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                              criteria.score === criteria.maxScore
                                ? 'text-green-800 1bg-green-100'
                                : criteria.score &&
                                    criteria.score > criteria.maxScore / 2
                                  ? 'text-yellow-800 1bg-yellow-100'
                                  : 'text-red-800 1bg-red-100'
                            } `}
                          >
                            {criteria.score}
                          </div>
                        )}
                      </div>
                      <div
                        key={index}
                        className="px-4 py-2 bg-white flex items-center"
                      >
                        {criteria.comment}
                      </div>
                    </Fragment>
                  ))}

                  <div
                    className={`bg-white col-span-2 uppercase py-4 px-6 flex items-center justify-center text-sm font-semibold text-gray-900 `}
                  >
                    Total for {block.name ?? ' - '}
                  </div>
                  <div className="bg-white flex items-center px-4 py-6 justify-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                        block.score === block.maxScore
                          ? 'text-green-800 1bg-green-100'
                          : block.score && block.score > block.maxScore / 2
                            ? 'text-yellow-800 1bg-yellow-100'
                            : 'text-red-800 1bg-red-100'
                      } `}
                    >
                      {block.score}
                    </div>
                  </div>
                  <div className="bg-white"></div>
                </Fragment>
              );
            })}
          <div
            className={`bg-white col-span-2 uppercase py-4 px-6 flex items-center justify-center text-sm font-semibold text-gray-900 `}
          >
            Tổng theo danh sách kiểm tra
          </div>
          <div className="flex items-center px-4 py-6 bg-white justify-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                checklistItem.score === checklistItem.maxScore
                  ? 'text-green-800 1bg-green-100'
                  : checklistItem.score &&
                      checklistItem.score > checklistItem.maxScore / 2
                    ? 'text-yellow-800 1bg-yellow-100'
                    : 'text-red-800 1bg-red-100'
              } `}
            >
              {checklistItem.score}
            </div>
          </div>
          <div className="bg-white"></div>
        </div>
      </Fragment>
    ));
};
