'use client';

import { useAppStore } from '@/lib/store';

export default function ModalContainer() {
  const { modal, closeModal } = useAppStore();

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={modal.onCancel}
      />

      {/* 对话框 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
        <h3 className="text-lg font-semibold mb-4">{modal.title}</h3>

        <div className="mb-6">
          {typeof modal.content === 'string' ? (
            <p className="text-gray-600">{modal.content}</p>
          ) : (
            modal.content
          )}
        </div>

        <div className="flex gap-3 justify-end">
          {modal.onCancel && (
            <button
              onClick={modal.onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {modal.cancelText || '取消'}
            </button>
          )}
          {modal.onConfirm && (
            <button
              onClick={modal.onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {modal.confirmText || '确认'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
