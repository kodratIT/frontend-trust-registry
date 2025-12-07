<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import Toast from '../common/Toast.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let sidebarOpen = $state(false);
</script>

<div class="h-screen flex bg-aurora bg-grid-aurora text-slate-100 overflow-hidden">
  <!-- Sidebar - Desktop -->
  <div class="hidden lg:block">
    <Sidebar />
  </div>

  <!-- Sidebar - Mobile Overlay -->
  {#if sidebarOpen}
    <div class="lg:hidden fixed inset-0 z-50">
      <div 
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onclick={() => sidebarOpen = false}
        onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
        role="button"
        tabindex="0"
      ></div>
      <div class="relative h-full w-72 animate-slide-up">
        <Sidebar />
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0">
    <Header onMenuClick={() => sidebarOpen = !sidebarOpen} />
    
    <main class="flex-1 overflow-auto p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        {@render children()}
      </div>
    </main>
  </div>
</div>

<Toast />
