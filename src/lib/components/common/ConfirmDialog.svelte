<script lang="ts">
  import Modal from './Modal.svelte';
  import { AlertTriangle } from 'lucide-svelte';

  interface Props {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
  }: Props = $props();

  const variantClasses = {
    danger: 'bg-rose-500 hover:bg-rose-600',
    warning: 'bg-aurora-gold hover:bg-amber-500',
    info: 'bg-aurora-teal hover:bg-teal-500',
  };
</script>

<Modal {open} {title} size="sm" onClose={onCancel}>
  <div class="flex flex-col items-center text-center">
    <div class="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
      <AlertTriangle class="w-8 h-8 text-rose-400" />
    </div>
    <p class="text-slate-300">{message}</p>
  </div>

  {#snippet footer()}
    <button class="btn-secondary" onclick={onCancel}>
      {cancelText}
    </button>
    <button class="px-5 py-2.5 rounded-xl font-medium text-slate-900 {variantClasses[variant]}" onclick={onConfirm}>
      {confirmText}
    </button>
  {/snippet}
</Modal>
