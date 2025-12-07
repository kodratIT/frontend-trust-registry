<script lang="ts">
  import { Inbox } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    icon?: typeof Inbox;
    action?: Snippet;
  }

  let {
    title = 'No data found',
    description = 'There are no items to display.',
    icon: Icon = Inbox,
    action,
  }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6">
    <Icon class="w-10 h-10 text-slate-500" />
  </div>
  <h3 class="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
  <p class="text-slate-400 mb-6 max-w-md">{description}</p>
  {#if action}
    {@render action()}
  {/if}
</div>
