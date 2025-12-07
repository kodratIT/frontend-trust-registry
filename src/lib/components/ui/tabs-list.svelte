<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '' }: Props = $props();
</script>

<div class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground {className}">
  {@render children()}
</div>
