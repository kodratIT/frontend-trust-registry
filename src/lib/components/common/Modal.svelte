<script lang="ts">
  import { X } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: Snippet;
    footer?: Snippet;
    onClose?: () => void;
  }

  let { open = $bindable(false), title, size = 'md', children, footer, onClose }: Props = $props();
  
  function handleClose() {
    open = false;
    onClose?.();
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onclick={handleClose}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && handleClose()}
    ></div>

    <!-- Modal -->
    <div
      class="relative w-full {sizeClasses[size]} bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl animate-slide-up"
    >
      <!-- Header -->
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/30">
          <h2 class="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            onclick={handleClose}
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      {/if}

      <!-- Content -->
      <div class="p-6">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="px-6 py-4 border-t border-slate-700/30 flex justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
