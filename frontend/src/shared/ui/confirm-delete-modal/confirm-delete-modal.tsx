// Ghi chú nhóm: Việt hóa hoặc tinh chỉnh hiển thị của thành phần giao diện dùng chung.
import { TrashRedIcon } from '@/../public/assets/icons'
import Button from '@/shared/ui/button/button'
import { Modal } from '@/shared/ui/modal/modal'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  itemName?: string | null
  itemType: string
  isLoading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  itemName,
  itemType,
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={`Xóa ${itemType}`}
      onClose={onClose}
      className="mx-auto max-w-[500px]"
    >
      <div className="flex flex-col items-center gap-4 px-8 py-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <TrashRedIcon width={28} height={28} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bạn có chắc muốn xóa?
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {itemName ? (
              <>
                {itemType} <span className="font-semibold text-gray-800 dark:text-gray-200">“{itemName}”</span>{' '}
                sẽ bị xóa khỏi hệ thống.
              </>
            ) : (
              `${itemType} này sẽ bị xóa khỏi hệ thống.`
            )}{' '}
            Thao tác này không thể hoàn tác.
          </p>
        </div>
        <div className="mt-4 flex w-full justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-full px-5 py-2"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-full bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
