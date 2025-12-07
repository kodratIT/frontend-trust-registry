<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
    class?: string;
  }

  let { children, class: className = '', ...restProps }: Props = $props();
</script>

<div class="flex flex-col space-y-1.5 p-6 {className}" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
