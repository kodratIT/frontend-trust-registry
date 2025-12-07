<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import AppSidebar from './AppSidebar.svelte';
  import AppHeader from './AppHeader.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  
  let sidebarCollapsed = $state(false);
  let mobileMenuOpen = $state(false);

  // Load sidebar state from cookie
  onMount(() => {
    const savedState = document.cookie
      .split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    
    if (savedState === 'collapsed') {
      sidebarCollapsed = true;
    }
  });

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    // Save to cookie
    document.cookie = `sidebar_state=${sidebarCollapsed ? 'collapsed' : 'expanded'}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<div class="flex h-screen w-full bg-background overflow-hidden">
  <!-- Desktop Sidebar - Fixed -->
  <div class="hidden lg:block fixed inset-y-0 left-0 z-30">
    <AppSidebar bind:collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
  </div>

  <!-- Mobile Sidebar Overlay -->
  {#if mobileMenuOpen}
    <div class="fixed inset-0 z-50 lg:hidden">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/80"
        onclick={() => mobileMenuOpen = false}
        onkeydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
        role="button"
        tabindex="0"
      ></div>
      
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 w-72 bg-sidebar z-50">
        <AppSidebar collapsed={false} />
      </div>
    </div>
  {/if}

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-h-screen transition-all duration-200 {sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64'}">
    <!-- Header - Sticky -->
    <AppHeader 
      onMenuClick={toggleMobileMenu} 
      onToggleSidebar={toggleSidebar}
    />
    
    <!-- Scrollable Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="container mx-auto p-4 md:p-6 lg:p-8">
        {@render children()}
      </div>
    </main>
  </div>
</div>
