<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    LayoutDashboard, Shield, Database, UserCheck, UserCog, 
    FileJson, Search, ClipboardList, Settings, ChevronLeft, ChevronRight,
    LogOut, ChevronsUpDown, Sparkles, Zap, Link2, Key
  } from 'lucide-svelte';
  import { auth } from '$lib/stores';

  interface Props {
    collapsed?: boolean;
    onToggle?: () => void;
  }

  let { collapsed = $bindable(false), onToggle }: Props = $props();

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Trust Management',
      items: [
        { label: 'Trust Frameworks', href: '/trust-frameworks', icon: Shield },
        { label: 'Registries', href: '/registries', icon: Database },
        { label: 'Issuers', href: '/issuers', icon: UserCheck },
        { label: 'Verifiers', href: '/verifiers', icon: UserCog },
        { label: 'Schemas', href: '/schemas', icon: FileJson },
      ]
    },
    {
      title: 'TRQP Protocol',
      items: [
        { label: 'TRQP Query', href: '/trqp', icon: Zap },
        { label: 'Recognitions', href: '/recognitions', icon: Link2 },
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'Legacy Query', href: '/query', icon: Search },
        { label: 'Audit Logs', href: '/audit', icon: ClipboardList },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'API Keys', href: '/api-keys', icon: Key },
        { label: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  function isActive(href: string): boolean {
    if (href === '/') return $page.url.pathname === '/';
    return $page.url.pathname.startsWith(href);
  }

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  let userMenuOpen = $state(false);
</script>

<aside 
  class="sidebar group/sidebar relative"
  data-state={collapsed ? 'collapsed' : 'expanded'}
>
  <!-- Header -->
  <div class="sidebar-header">
    <a href="/" class="flex items-center gap-3 font-semibold overflow-hidden">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles class="h-5 w-5" />
      </div>
      {#if !collapsed}
        <span class="truncate text-lg">Trust Registry</span>
      {/if}
    </a>
  </div>

  <!-- Content -->
  <div class="sidebar-content">
    {#each navGroups as group}
      <div class="sidebar-group">
        {#if !collapsed}
          <div class="sidebar-group-label">{group.title}</div>
        {/if}
        <div class="sidebar-menu">
          {#each group.items as item}
            <div class="sidebar-menu-item">
              <a
                href={item.href}
                class="sidebar-menu-button"
                data-active={isActive(item.href)}
                title={collapsed ? item.label : undefined}
              >
                <item.icon class="sidebar-icon" />
                {#if !collapsed}
                  <span class="truncate">{item.label}</span>
                {/if}
              </a>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Footer -->
  <div class="sidebar-footer">
    <div class="relative">
      <button
        type="button"
        onclick={() => userMenuOpen = !userMenuOpen}
        class="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
          AD
        </div>
        {#if !collapsed}
          <div class="flex-1 text-left overflow-hidden">
            <p class="text-sm font-medium truncate">Admin</p>
            <p class="text-xs text-muted-foreground truncate capitalize">{$auth.role || 'User'}</p>
          </div>
          <ChevronsUpDown class="h-4 w-4 text-muted-foreground shrink-0" />
        {/if}
      </button>

      {#if userMenuOpen}
        <div class="absolute bottom-full left-0 right-0 mb-2 rounded-lg border bg-popover p-1 shadow-lg animate-in z-50">
          <button
            type="button"
            onclick={() => { userMenuOpen = false; goto('/settings'); }}
            class="dropdown-item w-full"
          >
            <Settings class="mr-2 h-4 w-4" />
            Settings
          </button>
          <div class="dropdown-separator"></div>
          <button
            type="button"
            onclick={() => { userMenuOpen = false; handleLogout(); }}
            class="dropdown-item w-full text-red-500 hover:text-red-500"
          >
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Collapse Toggle Button -->
  <button
    type="button"
    onclick={onToggle}
    class="collapse-toggle"
    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {#if collapsed}
      <ChevronRight class="h-4 w-4" />
    {:else}
      <ChevronLeft class="h-4 w-4" />
    {/if}
  </button>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: hsl(var(--sidebar));
    border-right: 1px solid hsl(var(--sidebar-border));
    width: 16rem;
    transition: width 200ms ease-linear;
  }
  
  .sidebar[data-state="collapsed"] {
    width: 4.5rem;
  }

  .sidebar-header {
    display: flex;
    height: 3.5rem;
    align-items: center;
    border-bottom: 1px solid hsl(var(--sidebar-border));
    padding: 0 1rem;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem;
  }

  .sidebar-footer {
    border-top: 1px solid hsl(var(--sidebar-border));
    padding: 0.5rem;
  }

  .sidebar-group {
    padding: 0.5rem 0;
  }

  .sidebar-group-label {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sidebar-menu-button {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
    border-radius: 0.5rem;
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--sidebar-foreground) / 0.7);
    transition: all 150ms;
  }

  .sidebar-menu-button:hover {
    background: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  .sidebar-menu-button[data-active="true"] {
    background: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  .sidebar-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  /* Collapsed state */
  .sidebar[data-state="collapsed"] .sidebar-group-label {
    display: none;
  }

  .sidebar[data-state="collapsed"] .sidebar-menu-button {
    justify-content: center;
    padding: 0.75rem;
  }

  .sidebar[data-state="collapsed"] .sidebar-menu-button span {
    display: none;
  }

  .sidebar[data-state="collapsed"] .sidebar-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Collapse toggle button */
  .collapse-toggle {
    position: absolute;
    right: -0.875rem;
    top: 4.5rem;
    display: flex;
    height: 1.75rem;
    width: 1.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    color: hsl(var(--muted-foreground));
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: all 150ms;
    z-index: 10;
  }

  .collapse-toggle:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
</style>
