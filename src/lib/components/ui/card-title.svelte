<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLAttributes<HTMLHeadingElement> {
    children?: Snippet;
    class?: string;
  }

  let { children, class: className = '', ...restProps }: Props = $props();
</script>

<h3 class="font-semibold leading-none tracking-tight {className}" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</h3>
