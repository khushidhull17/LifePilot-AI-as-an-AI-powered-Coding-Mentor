import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'brand',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                Working...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-muted">
        This action will update your learning data. You can change it later.
      </p>
    </Modal>
  );
}
