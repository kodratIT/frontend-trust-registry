<script lang="ts">
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';

  interface Props {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  }

  let { page, totalPages, total, limit, onPageChange }: Props = $props();

  const start = $derived((page - 1) * limit + 1);
  const end = $derived(Math.min(page * limit, total));
</script>

<div class="flex items-center justify-between px-4 py-3 border-t border-slate-700/30">
  <p class="text-sm text-slate-400">
    Showing <span class="font-medium text-slate-200">{start}</span> to <span class="font-medium text-slate-200">{end}</span> of <span class="font-medium text-slate-200">{total}</span> results
  </p>
  
  <div class="flex items-center gap-1">
    <button 
      class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page <= 1}
      onclick={() => onPageChange(1)}
    >
      <ChevronsLeft class="w-4 h-4" />
    </button>
    <button 
      class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page <= 1}
      onclick={() => onPageChange(page - 1)}
    >
      <ChevronLeft class="w-4 h-4" />
    </button>
    
    <span class="px-4 py-2 text-sm text-slate-300">
      Page {page} of {totalPages}
    </span>
    
    <button 
      class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page >= totalPages}
      onclick={() => onPageChange(page + 1)}
    >
      <ChevronRight class="w-4 h-4" />
    </button>
    <button 
      class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      disabled={page >= totalPages}
      onclick={() => onPageChange(totalPages)}
    >
      <ChevronsRight class="w-4 h-4" />
    </button>
  </div>
</div>
