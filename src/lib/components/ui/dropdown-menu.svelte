<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronRight } from 'lucide-svelte';

  interface Props {
    trigger: Snippet;
    children: Snippet;
    align?: 'start' | 'center' | 'end';
    class?: string;
  }

  let { trigger, children, align = 'end', class: className = '' }: Props = $props();
  let open = $state(false);
  let menuRef: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      open = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="relative inline-block {className}" bind:this={menuRef}>
  <button type="button" onclick={() => open = !open} class="cursor-pointer">
    {@render trigger()}
  </button>

  {#if open}
    <div
      class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 {align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'} top-full mt-1"
      role="menu"
    >
      {@render children()}
    </div>
  {/if}
</div>
