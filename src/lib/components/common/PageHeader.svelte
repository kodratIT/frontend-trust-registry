<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;
  }

  let { title, description, actions }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-100">{title}</h1>
    {#if description}
      <p class="text-slate-400 mt-1">{description}</p>
    {/if}
  </div>
  {#if actions}
    <div class="flex gap-3">
      {@render actions()}
    </div>
  {/if}
</div>
