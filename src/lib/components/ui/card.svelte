<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
    class?: string;
  }

  let { children, class: className = '', ...restProps }: Props = $props();
</script>

<div class="rounded-xl border bg-card text-card-foreground shadow {className}" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
