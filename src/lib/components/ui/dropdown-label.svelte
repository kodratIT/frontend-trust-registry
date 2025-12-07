<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '' }: Props = $props();
</script>

<div class="px-2 py-1.5 text-sm font-semibold {className}">
  {@render children()}
</div>
