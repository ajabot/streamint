interface ConfirmModalProps {
  isOpen: boolean
  stationName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ isOpen, stationName, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onCancel}
      />
      <div className="relative bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-3">Delete Station</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-white">{stationName}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
