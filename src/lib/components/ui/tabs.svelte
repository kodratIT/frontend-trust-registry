<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  interface Props {
    value?: string;
    children: Snippet;
    class?: string;
    onchange?: (value: string) => void;
  }

  let { value = $bindable(''), children, class: className = '', onchange }: Props = $props();
  
  const activeTab = writable(value);
  
  $effect(() => {
    activeTab.set(value);
  });

  setContext('tabs', {
    activeTab,
    setActive: (tab: string) => {
      value = tab;
      activeTab.set(tab);
      onchange?.(tab);
    }
  });
</script>

<div class="{className}">
  {@render children()}
</div>
