import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { TrashRedIcon } from '@/../public/assets/icons';

interface Props {
  isOpen: boolean;
  operatorName?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmDeleteModal = ({
  isOpen,
  operatorName,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Xóa nhân viên"
      onClose={onClose}
      className="max-w-[500px] mx-auto"
    >
      <div className="px-8 py-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
          <TrashRedIcon width={28} height={28} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Xóa nhân viên này?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bạn có chắc muốn xóa{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {operatorName || 'nhân viên này'}
            </span>
            ? Thao tác này không thể hoàn tác.
          </p>
        </div>
        <div className="flex justify-end gap-3 w-full mt-4">
          <Button
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer rounded-full font-medium"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
