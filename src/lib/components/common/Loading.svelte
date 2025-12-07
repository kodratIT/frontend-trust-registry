<script lang="ts">
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    size?: 'sm' | 'md' | 'lg';
    fullPage?: boolean;
  }

  let { size = 'md', fullPage = false }: Props = $props();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };
</script>

{#if fullPage}
  <div class="flex items-center justify-center min-h-[300px]">
    <div class="flex flex-col items-center gap-4">
      <Loader2 class="w-10 h-10 text-aurora-mint animate-spin" />
      <p class="text-sm text-slate-400">Loading...</p>
    </div>
  </div>
{:else}
  <Loader2 class="{sizeClasses[size]} text-aurora-mint animate-spin" />
{/if}
