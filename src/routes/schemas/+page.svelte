<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, FileJson, Eye, Code, CheckCircle2, AlertCircle, ArrowUpRight, LayoutGrid, List, Shield } from 'lucide-svelte';
  import { schemaApi } from '$lib/api';
  import type { CredentialSchema, PaginationMeta } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Pagination from '$lib/components/common/Pagination.svelte';

  type ViewMode = 'grid' | 'table';

  let schemas = $state<CredentialSchema[]>([]);
  let meta = $state<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  let loading = $state(true);
  let page = $state(1);
  let stats = $state({ total: 0, open: 0, ecosystem: 0 });
  let viewMode = $state<ViewMode>('grid');

  async function loadSchemas() {
    loading = true;
    try {
      const response = await schemaApi.list({ page, limit: 12 });
      schemas = response.data;
      meta = response.meta;
      
      stats = {
        total: response.meta.total,
        open: response.data.filter((s: CredentialSchema) => s.issuerMode === 'OPEN').length,
        ecosystem: response.data.filter((s: CredentialSchema) => s.issuerMode === 'ECOSYSTEM').length,
      };
    } catch (error) {
      notifications.error('Failed to load schemas');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    const savedView = localStorage.getItem('schemas-view');
    if (savedView === 'grid' || savedView === 'table') {
      viewMode = savedView;
    }
    loadSchemas();
  });

  function handlePageChange(newPage: number) {
    page = newPage;
    loadSchemas();
  }

  function toggleView(mode: ViewMode) {
    viewMode = mode;
    localStorage.setItem('schemas-view', mode);
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-500"><FileJson class="h-7 w-7" /></div>
        Credential Schemas
      </h1>
      <p class="text-muted-foreground mt-1">Define and manage credential schema definitions</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="inline-flex items-center rounded-lg border bg-background p-1">
        <button onclick={() => toggleView('grid')} class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
          <LayoutGrid class="h-4 w-4" /><span class="hidden sm:inline">Grid</span>
        </button>
        <button onclick={() => toggleView('table')} class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'table' ? 'bg-cyan-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
          <List class="h-4 w-4" /><span class="hidden sm:inline">Table</span>
        </button>
      </div>
      <a href="/schemas/new" class="btn-default flex items-center gap-2"><Plus class="h-4 w-4" />New Schema</a>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Total Schemas</p><p class="text-2xl font-bold mt-1">{stats.total}</p></div><div class="p-3 rounded-xl bg-cyan-500/10 text-cyan-500"><FileJson class="h-6 w-6" /></div></div></div></div>
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Open Mode</p><p class="text-2xl font-bold mt-1 text-emerald-500">{stats.open}</p></div><div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 class="h-6 w-6" /></div></div></div></div>
    <div class="card"><div class="card-content p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Ecosystem Mode</p><p class="text-2xl font-bold mt-1 text-blue-500">{stats.ecosystem}</p></div><div class="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Shield class="h-6 w-6" /></div></div></div></div>
  </div>

  {#if loading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{#each Array(6) as _}<div class="card"><div class="card-content p-6 space-y-4"><div class="h-6 w-32 animate-pulse rounded bg-muted"></div><div class="h-4 w-full animate-pulse rounded bg-muted"></div></div></div>{/each}</div>
  {:else if schemas.length === 0}
    <div class="card"><div class="card-content p-12"><div class="text-center"><div class="inline-flex p-4 rounded-full bg-cyan-500/10 text-cyan-500 mb-4"><FileJson class="h-12 w-12" /></div><h3 class="text-lg font-semibold mb-2">No schemas</h3><p class="text-muted-foreground mb-6">Create your first credential schema to define credential structures.</p><a href="/schemas/new" class="btn-default inline-flex items-center gap-2"><Plus class="h-4 w-4" />New Schema</a></div></div></div>
  {:else}
    {#if viewMode === 'grid'}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each schemas as schema}
          <a href="/schemas/{schema.id}" class="card group hover:shadow-lg hover:border-cyan-500/50 transition-all duration-300">
            <div class="card-content p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 text-sm font-medium group-hover:bg-cyan-500/20 transition-colors">{getInitials(schema.name)}</div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.issuerMode}</span>
                  <span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.verifierMode}</span>
                </div>
              </div>
              <div class="space-y-3">
                <div><h3 class="font-semibold text-lg group-hover:text-cyan-500 transition-colors line-clamp-1">{schema.name}</h3><p class="text-xs text-muted-foreground mt-1">{schema.type} v{schema.version}</p></div>
                {#if schema.registry}<div class="flex items-center gap-2 text-sm"><Shield class="h-4 w-4 text-muted-foreground" /><span class="text-muted-foreground truncate">{schema.registry.name}</span></div>{/if}
                <div class="flex items-center justify-between pt-3 border-t"><div class="text-sm text-muted-foreground">JSON Schema</div><ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-cyan-500 transition-colors" /></div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="card"><div class="overflow-x-auto"><table class="w-full"><thead class="border-b"><tr class="text-left"><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Schema</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Type</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Version</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Issuer Mode</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground">Verifier Mode</th><th class="px-6 py-4 text-sm font-medium text-muted-foreground"></th></tr></thead><tbody class="divide-y">{#each schemas as schema}<tr class="group hover:bg-muted/50 transition-colors"><td class="px-6 py-4"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 text-sm font-medium">{getInitials(schema.name)}</div><div><a href="/schemas/{schema.id}" class="font-medium hover:text-cyan-500 transition-colors">{schema.name}</a></div></div></td><td class="px-6 py-4"><span class="text-sm">{schema.type}</span></td><td class="px-6 py-4"><span class="font-mono text-xs text-muted-foreground">{schema.version}</span></td><td class="px-6 py-4"><span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.issuerMode}</span></td><td class="px-6 py-4"><span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.verifierMode}</span></td><td class="px-6 py-4"><a href="/schemas/{schema.id}" class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-cyan-500 transition-colors opacity-0 group-hover:opacity-100"><Eye class="h-4 w-4" /></a></td></tr>{/each}</tbody></table></div></div>
    {/if}
    {#if meta.totalPages > 1}<div class="card"><div class="card-content p-4"><Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={handlePageChange} /></div></div>{/if}
  {/if}
</div>
