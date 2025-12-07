<script lang="ts" module>
  export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors';

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'border-transparent bg-primary text-primary-foreground shadow',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
    outline: 'text-foreground',
    success: 'border-transparent bg-emerald-500/20 text-emerald-400',
    warning: 'border-transparent bg-amber-500/20 text-amber-400',
  };

  export function badgeVariants(opts: { variant?: BadgeVariant } = {}) {
    const v = opts.variant || 'default';
    return `${baseClasses} ${variantClasses[v]}`;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: BadgeVariant;
    children?: Snippet;
    class?: string;
  }

  let { variant = 'default', children, class: className = '' }: Props = $props();
</script>

<div class="{badgeVariants({ variant })} {className}">
  {#if children}
    {@render children()}
  {/if}
</div>
