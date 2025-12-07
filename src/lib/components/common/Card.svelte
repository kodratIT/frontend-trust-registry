<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    children: Snippet;
    actions?: Snippet;
  }

  let { title, children, actions }: Props = $props();
</script>

<div class="card-aurora p-6">
  {#if title || actions}
    <div class="flex items-center justify-between mb-6">
      {#if title}
        <h2 class="text-lg font-semibold text-white">{title}</h2>
      {/if}
      {#if actions}
        <div class="flex gap-2">
          {@render actions()}
        </div>
      {/if}
    </div>
  {/if}
  {@render children()}
</div>
