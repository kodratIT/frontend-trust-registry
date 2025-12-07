<script lang="ts">
  import { 
    Search, Bell, Moon, Sun, Menu, PanelLeft, Settings, LogOut
  } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores';
  import { onMount } from 'svelte';

  interface Props {
    onMenuClick?: () => void;
    onToggleSidebar?: () => void;
  }

  let { onMenuClick, onToggleSidebar }: Props = $props();

  let notificationsOpen = $state(false);
  let profileOpen = $state(false);
  let darkMode = $state(true);

  // Initialize dark mode
  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      darkMode = false;
      document.documentElement.classList.remove('dark');
    } else {
      darkMode = true;
      document.documentElement.classList.add('dark');
    }
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Generate breadcrumb from path
  const breadcrumbs = $derived(() => {
    const path = $page.url.pathname;
    if (path === '/') return [{ label: 'Dashboard', href: '/' }];
    
    const segments = path.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      return { label, href };
    });
  });

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  const notifications = [
    { id: 1, title: 'New issuer registered', desc: 'did:web:university.edu joined the registry', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Schema updated', desc: 'EducationCredential v2.0 published', time: '1 hour ago', unread: true },
    { id: 3, title: 'Issuer suspended', desc: 'did:web:old-issuer.org status changed', time: '3 hours ago', unread: false },
  ];

  const unreadCount = $derived(notifications.filter(n => n.unread).length);

  // Close dropdowns when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-trigger')) {
      notificationsOpen = false;
    }
    if (!target.closest('.profile-dropdown') && !target.closest('.profile-trigger')) {
      profileOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<header class="header">
  <!-- Mobile menu button -->
  <button
    type="button"
    onclick={onMenuClick}
    class="header-btn lg:hidden"
  >
    <Menu class="h-5 w-5" />
    <span class="sr-only">Toggle menu</span>
  </button>

  <!-- Sidebar toggle (desktop) -->
  <button
    type="button"
    onclick={onToggleSidebar}
    class="header-btn hidden lg:flex"
  >
    <PanelLeft class="h-5 w-5" />
    <span class="sr-only">Toggle sidebar</span>
  </button>

  <!-- Separator -->
  <div class="h-4 w-px bg-border hidden lg:block"></div>

  <!-- Breadcrumb -->
  <nav class="hidden md:flex items-center gap-1.5 text-sm">
    {#each breadcrumbs() as crumb, i}
      {#if i > 0}
        <span class="text-muted-foreground">/</span>
      {/if}
      <a 
        href={crumb.href} 
        class="transition-colors {i === breadcrumbs().length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}"
      >
        {crumb.label}
      </a>
    {/each}
  </nav>

  <div class="flex-1"></div>

  <!-- Search -->
  <div class="hidden md:flex items-center mr-2">
    <button
      type="button"
      class="relative h-9 w-64 justify-start rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground flex items-center transition-colors"
    >
      <Search class="mr-2 h-4 w-4" />
      Search...
      <kbd class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
        <span class="text-xs">⌘</span>K
      </kbd>
    </button>
  </div>

  <!-- Actions -->
  <div class="flex items-center gap-1">
    <!-- Dark Mode Toggle -->
    <button
      type="button"
      onclick={toggleDarkMode}
      class="header-btn"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {#if darkMode}
        <Sun class="h-5 w-5" />
      {:else}
        <Moon class="h-5 w-5" />
      {/if}
      <span class="sr-only">Toggle theme</span>
    </button>

    <!-- Notifications -->
    <div class="relative">
      <button
        type="button"
        onclick={() => { notificationsOpen = !notificationsOpen; profileOpen = false; }}
        class="header-btn notifications-trigger relative"
      >
        <Bell class="h-5 w-5" />
        {#if unreadCount > 0}
          <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        {/if}
        <span class="sr-only">Notifications</span>
      </button>

      {#if notificationsOpen}
        <div class="notifications-dropdown absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover shadow-lg animate-in z-50">
          <div class="px-4 py-3 border-b">
            <h3 class="font-semibold">Notifications</h3>
            <p class="text-xs text-muted-foreground">{unreadCount} unread messages</p>
          </div>
          <div class="max-h-80 overflow-y-auto">
            {#each notifications as notif}
              <div class="flex items-start gap-3 p-4 hover:bg-accent cursor-pointer border-b last:border-0 transition-colors">
                <div class="mt-1 h-2 w-2 rounded-full {notif.unread ? 'bg-blue-500' : 'bg-muted'} shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{notif.title}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{notif.desc}</p>
                  <p class="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              </div>
            {/each}
          </div>
          <div class="p-2 border-t">
            <button type="button" class="w-full text-center text-sm text-primary hover:underline py-2">
              View all notifications
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Profile -->
    <div class="relative ml-1">
      <button
        type="button"
        onclick={() => { profileOpen = !profileOpen; notificationsOpen = false; }}
        class="profile-trigger flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-accent transition-colors"
      >
        AD
      </button>

      {#if profileOpen}
        <div class="profile-dropdown absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover shadow-lg animate-in z-50">
          <div class="px-4 py-3 border-b">
            <p class="text-sm font-medium">Admin</p>
            <p class="text-xs text-muted-foreground capitalize">{$auth.role || 'User'}</p>
          </div>
          <div class="p-1">
            <button
              type="button"
              onclick={() => { profileOpen = false; goto('/settings'); }}
              class="dropdown-item w-full"
            >
              <Settings class="mr-2 h-4 w-4" />
              Settings
            </button>
          </div>
          <div class="border-t p-1">
            <button
              type="button"
              onclick={() => { profileOpen = false; handleLogout(); }}
              class="dropdown-item w-full text-red-500 hover:text-red-500"
            >
              <LogOut class="mr-2 h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    height: 3.5rem;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid hsl(var(--border));
    background: hsl(var(--background) / 0.95);
    backdrop-filter: blur(8px);
    padding: 0 1rem;
  }

  @media (min-width: 1024px) {
    .header {
      padding: 0 1.5rem;
    }
  }

  .header-btn {
    display: flex;
    height: 2.25rem;
    width: 2.25rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    color: hsl(var(--muted-foreground));
    transition: all 150ms;
  }

  .header-btn:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  .animate-in {
    animation: fadeIn 150ms ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
