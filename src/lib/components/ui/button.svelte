<script lang="ts" module>
  export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

  const variantClasses: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  };

  export function buttonVariants(opts: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
    const v = opts.variant || 'default';
    const s = opts.size || 'default';
    return `${baseClasses} ${variantClasses[v]} ${sizeClasses[s]}`;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: Snippet;
    class?: string;
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
  }

  let { variant = 'default', size = 'default', children, class: className = '', href, disabled = false, type = 'button', onclick }: Props = $props();
</script>

{#if href}
  <a {href} class="{buttonVariants({ variant, size })} {className}">
    {#if children}
      {@render children()}
    {/if}
  </a>
{:else}
  <button {type} {disabled} {onclick} class="{buttonVariants({ variant, size })} {className}">
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
