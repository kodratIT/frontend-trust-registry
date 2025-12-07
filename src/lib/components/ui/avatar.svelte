<script lang="ts">
  interface Props {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { src, alt = '', fallback = '', size = 'md', class: className = '' }: Props = $props();

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  let imageError = $state(false);

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="relative flex shrink-0 overflow-hidden rounded-full {sizeClasses[size]} {className}">
  {#if src && !imageError}
    <img
      {src}
      {alt}
      class="aspect-square h-full w-full object-cover"
      onerror={() => imageError = true}
    />
  {:else}
    <div class="flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground">
      {fallback ? getInitials(fallback) : '?'}
    </div>
  {/if}
</div>
