<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Database, ExternalLink, Eye, CheckCircle2, AlertCircle, ArrowUpRight, LayoutGrid, List, Link2, Shield } from 'lucide-svelte';
  import { registryApi } from '$lib/api';
  import type { TrustRegistry, PaginationMeta } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Pagination from '$lib/components/common/Pagination.svelte';

  type ViewMode = 'grid' | 'table';

  let registries = $state<TrustRegistry[]>([]);
  let meta = $state<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  let loading = $state(true);
  let page = $state(1);
  let stats = $state({ total: 0, active: 0, inactive: 0 });
  let viewMode = $state<ViewMode>('grid');

  async function loadRegistries() {
    loading = true;
    try {
      const response = await registryApi.list({ page, limit: 12 });
      registries = response.data;
      meta = response.meta;
      
      stats = {
        total: response.meta.total,
        active: response.data.filter((r: TrustRegistry) => r.status === 'active').length,
        inactive: response.data.filter((r: TrustRegistry) => r.status !== 'active').length,
      };
    } catch (error) {
      notifications.error('Failed to load registries');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    const savedView = localStorage.getItem('registries-view');
    if (savedView === 'grid' || savedView === 'table') {
      viewMode = savedView;
    }
    loadRegistries();
  });

  function handlePageChange(newPage: number) {
    page = newPage;
    loadRegistries();
  }

  function toggleView(mode: ViewMode) {
    viewMode = mode;
    localStorage.setItem('registries-view', mode);
  }

  function getStatusIcon(status: string) {
    return status === 'active' ? CheckCircle2 : AlertCircle;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'text-emerald-500 bg-emerald-500/10';
      case 'inactive': return 'text-amber-500 bg-amber-500/10';
      case 'deprecated': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <Database class="h-7 w-7" />
        </div>
        Trust Registries
      </h1>
      <p class="text-muted-foreground mt-1">Manage trust registries and their participants</p>
    </div>
    <div class="flex items-center gap-2">
      <!-- View Toggle -->
      <div class="inline-flex items-center rounded-lg border bg-background p-1">
        <button
          onclick={() => toggleView('grid')}
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'grid' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
        >
          <LayoutGrid class="h-4 w-4" />
          <span class="hidden sm:inline">Grid</span>
        </button>
        <button
          onclick={() => toggleView('table')}
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all {viewMode === 'table' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
        >
          <List class="h-4 w-4" />
          <span class="hidden sm:inline">Table</span>
        </button>
      </div>
      <a href="/registries/new" class="btn-default flex items-center gap-2">
        <Plus class="h-4 w-4" />
        New Registry
      </a>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-4 md:grid-cols-3">
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Registries</p>
            <p class="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Database class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active</p>
            <p class="text-2xl font-bold mt-1 text-emerald-500">{stats.active}</p>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Inactive</p>
            <p class="text-2xl font-bold mt-1 text-amber-500">{stats.inactive}</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <AlertCircle class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  {#if loading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each Array(6) as _}
        <div class="card">
          <div class="card-content p-6 space-y-4">
            <div class="h-6 w-32 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-full animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if registries.length === 0}
    <div class="card">
      <div class="card-content p-12">
        <div class="text-center">
          <div class="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-500 mb-4">
            <Database class="h-12 w-12" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No trust registries</h3>
          <p class="text-muted-foreground mb-6">Create your first trust registry to start managing participants.</p>
          <a href="/registries/new" class="btn-default inline-flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Create Registry
          </a>
        </div>
      </div>
    </div>
  {:else}
    {#if viewMode === 'grid'}
      <!-- Grid View -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each registries as registry}
          {@const StatusIcon = getStatusIcon(registry.status)}
          <a 
            href="/registries/{registry.id}" 
            class="card group hover:shadow-lg hover:border-blue-500/50 transition-all duration-300"
          >
            <div class="card-content p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <Database class="h-6 w-6" />
                </div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full {getStatusColor(registry.status)}">
                  <StatusIcon class="h-3 w-3" />
                  <span class="text-xs font-medium capitalize">{registry.status}</span>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <h3 class="font-semibold text-lg group-hover:text-blue-500 transition-colors line-clamp-1">
                    {registry.name}
                  </h3>
                  {#if registry.description}
                    <p class="text-sm text-muted-foreground mt-1 line-clamp-2">{registry.description}</p>
                  {/if}
                </div>

                {#if registry.ecosystemDid}
                  <div class="flex items-center gap-2 text-sm">
                    <Link2 class="h-4 w-4 text-muted-foreground" />
                    <span class="font-mono text-xs text-muted-foreground truncate">{registry.ecosystemDid}</span>
                  </div>
                {/if}

                {#if registry.trustFramework}
                  <div class="flex items-center gap-2 text-sm">
                    <Shield class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground truncate">{registry.trustFramework.name}</span>
                  </div>
                {/if}

                <div class="flex items-center justify-between pt-3 border-t">
                  <div class="text-sm text-muted-foreground">
                    {(registry.issuers?.length || 0) + (registry.verifiers?.length || 0)} participants
                  </div>
                  <ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <!-- Table View -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b">
              <tr class="text-left">
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Registry</th>
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Ecosystem DID</th>
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Framework</th>
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Participants</th>
                <th class="px-6 py-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#each registries as registry}
                {@const StatusIcon = getStatusIcon(registry.status)}
                <tr class="group hover:bg-muted/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Database class="h-4 w-4" />
                      </div>
                      <div>
                        <a href="/registries/{registry.id}" class="font-medium hover:text-blue-500 transition-colors">
                          {registry.name}
                        </a>
                        {#if registry.description}
                          <p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">{registry.description}</p>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-mono text-xs text-muted-foreground">{registry.ecosystemDid}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full {getStatusColor(registry.status)}">
                      <StatusIcon class="h-3 w-3" />
                      <span class="text-xs font-medium capitalize">{registry.status}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    {#if registry.trustFramework}
                      <span class="text-sm">{registry.trustFramework.name}</span>
                    {:else}
                      <span class="text-muted-foreground text-sm">-</span>
                    {/if}
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm">{(registry.issuers?.length || 0) + (registry.verifiers?.length || 0)}</span>
                  </td>
                  <td class="px-6 py-4">
                    <a href="/registries/{registry.id}" class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye class="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if meta.totalPages > 1}
      <div class="card">
        <div class="card-content p-4">
          <Pagination 
            page={meta.page} 
            totalPages={meta.totalPages} 
            total={meta.total} 
            limit={meta.limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    {/if}
  {/if}
</div>
