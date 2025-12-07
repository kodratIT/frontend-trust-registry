<script lang="ts">
  import { page } from '$app/stores';
  import { 
    LayoutDashboard, 
    Shield, 
    Database, 
    FileJson, 
    UserCheck, 
    UserCog, 
    Search, 
    ClipboardList,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Zap,
    Link2,
    Key
  } from 'lucide-svelte';

  let collapsed = $state(false);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trust-frameworks', label: 'Trust Frameworks', icon: Shield },
    { href: '/registries', label: 'Registries', icon: Database },
    { href: '/schemas', label: 'Schemas', icon: FileJson },
    { href: '/issuers', label: 'Issuers', icon: UserCheck },
    { href: '/verifiers', label: 'Verifiers', icon: UserCog },
    { href: '/trqp', label: 'TRQP Query', icon: Zap },
    { href: '/recognitions', label: 'Recognitions', icon: Link2 },
    { href: '/query', label: 'Legacy Query', icon: Search },
    { href: '/api-keys', label: 'API Keys', icon: Key },
    { href: '/audit', label: 'Audit Logs', icon: ClipboardList },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
</script>

<aside class="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/30 transition-all duration-300 {collapsed ? 'w-20' : 'w-72'}">
  <!-- Logo -->
  <div class="p-6 border-b border-slate-700/30">
    <div class="flex items-center gap-3">
      <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-aurora-mint to-aurora-teal flex items-center justify-center animate-pulse-glow">
        <Sparkles class="w-6 h-6 text-slate-900" />
      </div>
      {#if !collapsed}
        <div class="animate-fade-in">
          <h1 class="font-semibold text-slate-100 tracking-tight">Trust Registry</h1>
          <p class="text-xs text-slate-400">ToIP v2 Protocol</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 p-4 overflow-y-auto">
    <ul class="space-y-1">
      {#each menuItems as item}
        {@const active = isActive(item.href, $page.url.pathname)}
        <li>
          <a 
            href={item.href} 
            class="sidebar-aurora {active ? 'active' : ''}"
            title={collapsed ? item.label : undefined}
          >
            <item.icon class="w-5 h-5 flex-shrink-0 {active ? 'text-aurora-mint' : ''}" />
            {#if !collapsed}
              <span class="animate-fade-in">{item.label}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Collapse Toggle -->
  <div class="p-4 border-t border-slate-700/30">
    <button 
      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
      onclick={() => collapsed = !collapsed}
    >
      {#if collapsed}
        <ChevronRight class="w-5 h-5" />
      {:else}
        <ChevronLeft class="w-5 h-5" />
        <span class="text-sm">Collapse</span>
      {/if}
    </button>
  </div>
</aside>
