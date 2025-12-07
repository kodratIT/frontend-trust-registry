<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  interface Props {
    value: string;
    children: Snippet;
    class?: string;
  }

  let { value, children, class: className = '' }: Props = $props();
  
  const { activeTab } = getContext<{
    activeTab: Writable<string>;
  }>('tabs');

  let isActive = $state(false);
  
  $effect(() => {
    const unsubscribe = activeTab.subscribe(v => {
      isActive = v === value;
    });
    return unsubscribe;
  });
</script>

{#if isActive}
  <div
    role="tabpanel"
    class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {className}"
  >
    {@render children()}
  </div>
{/if}
