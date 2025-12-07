<script lang="ts">
  import { X } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    description?: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    children: Snippet;
    onClose?: () => void;
  }

  let { open = $bindable(false), title, description, side = 'right', children, onClose }: Props = $props();

  function handleClose() {
    open = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }

  const sideClasses = {
    left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r data-[state=open]:slide-in-from-left',
    right: 'inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l data-[state=open]:slide-in-from-right',
    top: 'inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom',
  };
</script>

{#if open}
  <div class="fixed inset-0 z-50" onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/80 animate-in fade-in-0"
      onclick={handleClose}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && handleClose()}
    ></div>

    <!-- Sheet -->
    <div class="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out animate-in duration-300 {sideClasses[side]}">
      <div class="flex flex-col space-y-2">
        {#if title}
          <h2 class="text-lg font-semibold text-foreground">{title}</h2>
        {/if}
        {#if description}
          <p class="text-sm text-muted-foreground">{description}</p>
        {/if}
      </div>
      
      <div class="mt-4">
        {@render children()}
      </div>

      <button
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onclick={handleClose}
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>
    </div>
  </div>
{/if}
