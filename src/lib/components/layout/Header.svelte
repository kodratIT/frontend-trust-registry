<script lang="ts">
  import { auth, isAuthenticated } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { Menu, LogOut, User, Bell, Search, Command, ChevronDown } from 'lucide-svelte';

  interface Props {
    onMenuClick?: () => void;
  }

  let { onMenuClick }: Props = $props();
  let dropdownOpen = $state(false);

  function handleLogout() {
    auth.logout();
    goto('/login');
  }
</script>

<header class="h-14 px-6 flex items-center justify-between border-b border-slate-800/50">
  <!-- Left: Menu & Search -->
  <div class="flex items-center gap-4">
    <button class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all" onclick={onMenuClick}>
      <Menu class="w-5 h-5" />
    </button>
    
    <!-- Command Palette Trigger -->
    <button class="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 transition-all group">
      <Search class="w-4 h-4" />
      <span class="text-sm">Search</span>
      <kbd class="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-slate-600 bg-slate-800/60 group-hover:text-slate-500">
        <Command class="w-2.5 h-2.5" />K
      </kbd>
    </button>
  </div>

  <!-- Right: Actions -->
  <div class="flex items-center gap-2">
    {#if $isAuthenticated}
      <!-- Notifications -->
      <button class="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
        <Bell class="w-[18px] h-[18px]" />
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-aurora-mint rounded-full"></span>
      </button>

      <!-- User Menu -->
      <div class="relative">
        <button 
          class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all"
          onclick={() => dropdownOpen = !dropdownOpen}
          onblur={() => setTimeout(() => dropdownOpen = false, 150)}
        >
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-aurora-mint/80 to-aurora-teal/80 flex items-center justify-center">
            <span class="text-xs font-semibold text-slate-900">A</span>
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-slate-300 leading-none">Admin</p>
          </div>
          <ChevronDown class="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
        </button>
        
        <!-- Dropdown -->
        {#if dropdownOpen}
          <div class="absolute right-0 top-full mt-1 w-48 py-1.5 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl animate-fade-in z-50">
            <div class="px-3 py-2 border-b border-slate-700/50">
              <p class="text-sm font-medium text-slate-200">Admin</p>
              <p class="text-xs text-slate-500">Registry Owner</p>
            </div>
            <div class="py-1">
              <a href="/settings" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors">
                <User class="w-4 h-4" />
                Settings
              </a>
              <button onclick={handleLogout} class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400/80 hover:text-rose-400 hover:bg-slate-700/40 transition-colors">
                <LogOut class="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</header>
