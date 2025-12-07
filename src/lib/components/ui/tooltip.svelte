<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    content: string;
    children: Snippet;
    side?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
  }

  let { content, children, side = 'top', class: className = '' }: Props = $props();
  let show = $state(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
</script>

<div
  class="relative inline-flex {className}"
  onmouseenter={() => show = true}
  onmouseleave={() => show = false}
  onfocus={() => show = true}
  onblur={() => show = false}
  role="tooltip"
>
  {@render children()}
  {#if show}
    <div
      class="absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 {sideClasses[side]}"
    >
      {content}
    </div>
  {/if}
</div>
