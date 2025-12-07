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
  
  const { activeTab, setActive } = getContext<{
    activeTab: Writable<string>;
    setActive: (tab: string) => void;
  }>('tabs');

  let isActive = $state(false);
  
  $effect(() => {
    const unsubscribe = activeTab.subscribe(v => {
      isActive = v === value;
    });
    return unsubscribe;
  });
</script>

<button
  type="button"
  role="tab"
  aria-selected={isActive}
  onclick={() => setActive(value)}
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 {isActive ? 'bg-background text-foreground shadow' : ''} {className}"
>
  {@render children()}
</button>
