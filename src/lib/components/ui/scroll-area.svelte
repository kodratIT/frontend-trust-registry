<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
    orientation?: 'vertical' | 'horizontal' | 'both';
  }

  let { children, class: className = '', orientation = 'vertical' }: Props = $props();

  const overflowClasses = {
    vertical: 'overflow-y-auto overflow-x-hidden',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-auto',
  };
</script>

<div class="relative {overflowClasses[orientation]} {className}">
  {@render children()}
</div>

<style>
  div {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  div::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  div::-webkit-scrollbar-track {
    background: transparent;
  }
  div::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 4px;
  }
  div::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground));
  }
</style>
