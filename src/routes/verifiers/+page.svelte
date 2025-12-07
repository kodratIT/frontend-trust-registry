<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, UserCog, CheckCircle2, AlertCircle, ArrowUpRight, LayoutGrid, List, Eye, Shield } from 'lucide-svelte';
  import { verifierApi } from '$lib/api';
  import type { Verifier, PaginationMeta } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Pagination from '$lib/components/common/Pagination.svelte';

  type ViewMode = 'grid' | 'table';

  let verifiers = $state<Verifier[]>([]);
  let meta = $state<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  let loading = $state(true);
  let page = $state(1);
  let stats = $state({ total: 0, active: 0, inactive: 0 });
  let viewMode = $state<ViewMode>('grid');

  async function loadVerifiers() {
    loading = true;
    try {
      const response = await verifierApi.list({ page, limit: 12 });
      verifiers = response.data;
      meta = response.meta;
      
      stats = {
        total: response.meta.total,
        active: response.data.filter((v: Verifier) => v.status === 'active').length,
        inactive: response.data.filter((v: Verifier) => v.status !== 'active').length,
      };
    } catch (error) {
      notifications.error('Failed to load verifiers');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    const savedView = localStorage.getItem('verifiers-view');
    if (savedView === 'grid' || savedView === 'table') {
      viewMode = savedView;
    }
    loadVerifiers();
  });

  function handlePageChange(newPage: number) {
    page = newPage;
    loadVerifiers();
  }

  function toggleView(mode: ViewMode) {
    viewMode = mode;
    localStorage.setItem('verifiers-view', mode);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'text-emerald-500 bg-emerald-500/10';
      case 'suspended': return 'text-amber-500 bg-amber-500/10';
      case 'revoked': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  }

  function getInitials(name: string | undefined, did: string): string {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const parts = did.split(':');
    return parts[parts.length - 1].slice(0, 2).toUpperCase();
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-amber-500/10 text-amber-500"><UserCog class="h-7 w-7" /></div>
        Verifiers
      </h1>
      <p class="text-muted-foreground mt-1">Manage credential verifiers in the trust ecosystem</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="inline-flex items-center rounded-lg border bg-background p-1">
        <button onclick={() => toggleView('grid')} class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'grid' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
          <LayoutGrid class="h-4 w-4" /><span class="hidden sm:inline">Grid</span>
        </button>
        <button onclick={() => toggleView('table')} class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'table' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
          <List class="h-4 w-4" /><span class="hidden sm:inline">Table</span>
        </button>
      </div>
      <a href="/verifiers/new" class="btn-default flex items-center gap-2"><Plus class="h-4 w-4" />Register Verifier</a>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Total Verifiers</p><p class="text-2xl font-bold mt-1">{stats.total}</p></div><div class="p-3 rounded-xl bg-amber-500/10 text-amber-500"><UserCog class="h-6 w-6" /></div></div></div></div>
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Active</p><p class="text-2xl font-bold mt-1 text-emerald-500">{stats.active}</p></div><div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 class="h-6 w-6" /></div></div></div></div>
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Inactive</p><p class="text-2xl font-bold mt-1 text-amber-500">{stats.inactive}</p></div><div class="p-3 rounded-xl bg-amber-500/10 text-amber-500"><AlertCircle class="h-6 w-6" /></div></div></div></div>
  </div>

  {#if loading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{#each Array(6) as _}<div class="card"><div class="card-content p-6 space-y-4"><div class="h-6 w-32 animate-pulse rounded bg-muted"></div><div class="h-4 w-full animate-pulse rounded bg-muted"></div></div></div>{/each}</div>
  {:else if verifiers.length === 0}
    <div class="card"><div class="card-content p-12"><div class="text-center"><div class="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4"><UserCog class="h-12 w-12" /></div><h3 class="text-lg font-semibold mb-2">No verifiers</h3><p class="text-muted-foreground mb-6">Register your first verifier to start verifying credentials.</p><a href="/verifiers/new" class="btn-default inline-flex items-center gap-2"><Plus class="h-4 w-4" />Register Verifier</a></div></div></div>
  {:else}
    {#if viewMode === 'grid'}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each verifiers as verifier}
          <a href="/verifiers/{encodeURIComponent(verifier.did)}" class="card group hover:shadow-lg hover:border-amber-500/50 transition-all duration-300">
            <div class="card-content p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium group-hover:bg-amber-500/20 transition-colors">{getInitials(verifier.name, verifier.did)}</div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full {getStatusColor(verifier.status)}">
                  {#if verifier.status === 'active'}<CheckCircle2 class="h-3 w-3" />{:else}<AlertCircle class="h-3 w-3" />{/if}
                  <span class="text-xs font-medium capitalize">{verifier.status}</span>
                </div>
              </div>
              <div class="space-y-3">
                <div><h3 class="font-semibold text-lg group-hover:text-amber-500 transition-colors line-clamp-1">{verifier.name || 'Unnamed Verifier'}</h3><p class="text-xs text-muted-foreground font-mono truncate mt-1">{verifier.did}</p></div>
                {#if verifier.registry}<div class="flex items-center gap-2 text-sm"><Shield class="h-4 w-4 text-muted-foreground" /><span class="text-muted-foreground truncate">{verifier.registry.name}</span></div>{/if}
                <div class="flex items-center justify-between pt-3 border-t"><div class="text-sm text-muted-foreground">{verifier.credentialTypes?.length || 0} credential types</div><ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" /></div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="card"><div class="overflow-x-auto"><table class="w-full"><thead class="border-b"><tr class="text-left"><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Verifier</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">DID</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Status</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Registry</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Credentials</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground"></th></tr></thead><tbody class="divide-y">{#each verifiers as verifier}<tr class="group hover:bg-muted/50 transition-colors"><td class="px-6 py-4"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium">{getInitials(verifier.name, verifier.did)}</div><div><a href="/verifiers/{encodeURIComponent(verifier.did)}" class="font-medium hover:text-amber-500 transition-colors">{verifier.name || 'Unnamed'}</a></div></div></td><td class="px-6 py-4"><span class="font-mono text-xs text-muted-foreground">{verifier.did}</span></td><td class="px-6 py-4"><div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full {getStatusColor(verifier.status)}">{#if verifier.status === 'active'}<CheckCircle2 class="h-3 w-3" />{:else}<AlertCircle class="h-3 w-3" />{/if}<span class="text-xs font-medium capitalize">{verifier.status}</span></div></td><td class="px-6 py-4">{#if verifier.registry}<span class="text-sm">{verifier.registry.name}</span>{:else}<span class="text-muted-foreground text-sm">-</span>{/if}</td><td class="px-6 py-4"><span class="text-sm">{verifier.credentialTypes?.length || 0}</span></td><td class="px-6 py-4"><a href="/verifiers/{encodeURIComponent(verifier.did)}" class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100"><Eye class="h-4 w-4" /></a></td></tr>{/each}</tbody></table></div></div>
    {/if}
    {#if meta.totalPages > 1}<div class="card"><div class="card-content p-4"><Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={handlePageChange} /></div></div>{/if}
  {/if}
</div>
