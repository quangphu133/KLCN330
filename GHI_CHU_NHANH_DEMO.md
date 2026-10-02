# Ghi chú nhánh demo

Nhánh: `demo`

Commit chức năng ban đầu: `69f9a8f` (`feat: improve Vietnamese UI and settings`)

## Nội dung chính

- Việt hóa nhãn, thông báo, lỗi và mô tả API trên các màn hình và luồng backend.
- Cải thiện màu sắc/chữ ở chế độ tối trên các trang và thành phần giao diện.
- Chỉnh trang đăng nhập, cài đặt tài khoản, thông báo và các nút thao tác theo yêu cầu demo.
- Thêm script khởi chạy backend mô phỏng bằng `backend/run_simulation.ps1`.

## Danh sách file đã sửa

### Backend — thông báo API, schema và nghiệp vụ

Các file dưới đây chủ yếu cập nhật câu chữ tiếng Việt, thông báo lỗi và mô tả dữ liệu/API:

- `backend/app/api/v1/endpoints/calls.py`
- `backend/app/api/v1/endpoints/files.py`
- `backend/app/api/v1/endpoints/mediafile.py`
- `backend/app/api/v1/endpoints/transcribe.py`
- `backend/app/api/v1/endpoints/violations.py`
- `backend/app/schemas/ai_schema.py`
- `backend/app/schemas/asr_schema.py`
- `backend/app/schemas/call_schema.py`
- `backend/app/schemas/checklist_schema.py`
- `backend/app/schemas/operator_schema.py`
- `backend/app/schemas/vocabulary_schema.py`
- `backend/app/services/call_service.py`
- `backend/app/services/checklist_service.py`
- `backend/app/services/file_service.py`
- `backend/app/services/mediafile_service.py`
- `backend/app/services/operator_service.py`
- `backend/app/services/project_service.py`
- `backend/app/services/user_service.py`
- `backend/app/services/vocabulary_service.py`

### Frontend — trang và tính năng

- **Bố cục/chủ đề:** `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/src/app/auth/sign-in/page.tsx`, `frontend/src/app/auth/under-construction-plain/page.tsx`, `frontend/src/app/calls/[id]/layout.tsx`, `frontend/src/app/calls/[id]/page.tsx`, `frontend/src/app/operators/layout.tsx`, `frontend/src/app/profile/layout.tsx`, `frontend/src/app/settings/layout.tsx`, `frontend/src/app/under-construction/layout.tsx`, `frontend/src/app/uploading-record/layout.tsx`.
- **Đăng nhập và phiên:** `frontend/src/features/auth/sign-in-form/sign-in-form.tsx`, `frontend/src/features/auth/sign-in-form/use-sign-in-form.tsx`, `frontend/src/widgets/AuthGate/AuthGate.tsx`, `frontend/src/entities/common/base-query.ts`.
- **Cài đặt, hồ sơ, thông báo:** `frontend/src/features/account-settings/account-settings.tsx`, `frontend/src/features/profile/profile.tsx`, `frontend/src/shared/ui/notification-dropdown/notification-dropdown.tsx`.
- **Cuộc gọi, transcript, bảng và phân tích:** `frontend/src/features/calls/call/call.tsx`, `frontend/src/features/calls/call/checklists/ChecklistTable.tsx`, `frontend/src/features/calls/call/checklists/checklist-summary.tsx`, `frontend/src/features/calls/call/checklists/checklists.tsx`, `frontend/src/features/calls/call/summary/summary.tsx`, `frontend/src/features/calls/call/transcript/transcript.tsx`, `frontend/src/features/calls/calls-feature-wrapper/calls-feature-wrapper.tsx`, `frontend/src/entities/mediafile/hooks/use-calls.ts`, `frontend/src/entities/mediafile/ui/calls-table/calls-table.tsx`, `frontend/src/features/analytics/analytics-bar-chart/analytics-bar-chart.tsx`, `frontend/src/features/analytics/analytics-filter-modal/analytics-filter-modal.tsx`, `frontend/src/features/analytics/analytics-impression-chart/analytics-impression-chart.tsx`, `frontend/src/features/analytics/analytics-metrics/analytics-metrics.tsx`, `frontend/src/features/analytics/analytics.tsx`, `frontend/src/features/analytics/top-channel/top-channel.tsx`, `frontend/src/features/analytics/top-pages/top-pages.tsx`, `frontend/src/shared/constants/header-table/calls-table/calls-table.ts`.
- **Danh mục, nhân viên, dự án, tải lên:** `frontend/src/entities/dictionaries/dictionaries.types.ts`, `frontend/src/features/checklists/EditChecklist.tsx`, `frontend/src/features/checklists/checklists.tsx`, `frontend/src/features/checklists/components/CreateChecklistModal.tsx`, `frontend/src/features/checklists/components/EditChecklistModal.tsx`, `frontend/src/features/checklists/components/checklists-table.tsx`, `frontend/src/features/dictionaries/components/CreateDictionaryModal.tsx`, `frontend/src/features/dictionaries/components/EditDictionaryModal.tsx`, `frontend/src/features/dictionaries/components/dictionaries-table.tsx`, `frontend/src/features/dictionaries/dictionaries.tsx`, `frontend/src/features/operators/components/ConfirmDeleteModal.tsx`, `frontend/src/features/operators/components/CreateOperatorModal.tsx`, `frontend/src/features/operators/components/EditOperatorModal.tsx`, `frontend/src/features/operators/components/operators-table.tsx`, `frontend/src/features/operators/operators.tsx`, `frontend/src/features/projects/components/CreateProjectModal.tsx`, `frontend/src/features/projects/components/EditProjectModal.tsx`, `frontend/src/features/projects/components/projects-table.tsx`, `frontend/src/features/under-construction/under-construction.tsx`, `frontend/src/features/uploading-record/upload-form.tsx`, `frontend/src/features/uploading-record/uploading-record.tsx`, `frontend/src/shared/constants/demo-data.ts`.
- **Thành phần giao diện dùng chung:** `frontend/public/assets/icons/pencil.svg`, `frontend/public/assets/icons/trash-red.svg`, `frontend/src/shared/ui/button/button.tsx`, `frontend/src/shared/ui/confirm-delete-modal/confirm-delete-modal.tsx`, `frontend/src/shared/ui/date-picker/date-picker.css`, `frontend/src/shared/ui/date-picker/date-picker.tsx`, `frontend/src/shared/ui/dropdown-custom/Dropdown.tsx`, `frontend/src/shared/ui/dropzone-component/dropzone-component.tsx`, `frontend/src/shared/ui/header/header.tsx`, `frontend/src/shared/ui/multiselect/multiselect.tsx`, `frontend/src/shared/ui/page-breadcrumb/page-breadcrumb.tsx`, `frontend/src/shared/ui/pagination/pagination.tsx`, `frontend/src/shared/ui/select/select.tsx`, `frontend/src/shared/ui/sidebar/ui/sidebar.tsx`, `frontend/src/shared/ui/switcher/Switcher.tsx`, `frontend/src/shared/ui/tab/tab.tsx`, `frontend/src/shared/ui/table/table.tsx`, `frontend/src/shared/ui/theme-toggle-button/theme-toggle-button.tsx`, `frontend/src/shared/ui/upload-alert/upload-alert.tsx`.

### Chạy mô phỏng

- `backend/run_simulation.ps1` — nạp cấu hình mô phỏng, khởi tạo dữ liệu và chạy FastAPI trên cổng `8001`.
- `backend/.env.simulation` không nằm trong commit; đây là file cấu hình môi trường cục bộ.

## Ghi chú kiểm tra

Danh sách này mô tả phạm vi file của commit `69f9a8f`. Chưa chạy lại kiểm thử trong lần ghi chú này; nhóm nên chạy quy trình kiểm thử/build trước khi merge.
