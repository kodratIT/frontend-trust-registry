<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    children: Snippet;
    destructive?: boolean;
    class?: string;
  }

  let { children, destructive = false, class: className = '', ...restProps }: Props = $props();
</script>

<button
  type="button"
  class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground {destructive ? 'text-destructive hover:text-destructive' : ''} {className}"
  role="menuitem"
  {...restProps}
>
  {@render children()}
</button>
