<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Link2, CheckCircle2, XCircle, Trash2, Eye, Calendar } from 'lucide-svelte';
  import { recognitionApi, registryApi } from '$lib/api';
  import type { Recognition } from '$lib/api';
  import type { TrustRegistry, PaginationMeta } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Pagination from '$lib/components/common/Pagination.svelte';

  let recognitions = $state<Recognition[]>([]);
  let registries = $state<TrustRegistry[]>([]);
  let meta = $state<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  let loading = $state(true);
  let page = $state(1);

  // Filters
  let filterAuthorityId = $state('');
  let filterEntityId = $state('');

  onMount(async () => {
    await Promise.all([loadRecognitions(), loadRegistries()]);
  });

  async function loadRegistries() {
    try {
      const res = await registryApi.list({ limit: 100 });
      registries = res.data;
    } catch (e) {
      console.error('Failed to load registries');
    }
  }

  async function loadRecognitions() {
    loading = true;
    try {
      const params: any = { page, limit: 10 };
      if (filterAuthorityId) params.authorityId = filterAuthorityId;
      if (filterEntityId) params.entityId = filterEntityId;
      
      const response = await recognitionApi.list(params);
      recognitions = response.data;
      meta = response.meta;
    } catch (error) {
      notifications.error('Failed to load recognitions');
    } finally {
      loading = false;
    }
  }

  async function deleteRecognition(id: string) {
    if (!confirm('Are you sure you want to revoke this recognition?')) return;
    
    try {
      await recognitionApi.delete(id);
      notifications.success('Recognition revoked');
      await loadRecognitions();
    } catch (error) {
      notifications.error('Failed to revoke recognition');
    }
  }

  function handlePageChange(newPage: number) {
    page = newPage;
    loadRecognitions();
  }

  function applyFilters() {
    page = 1;
    loadRecognitions();
  }

  function clearFilters() {
    filterAuthorityId = '';
    filterEntityId = '';
    page = 1;
    loadRecognitions();
  }

  function getRegistryName(id: string): string {
    const reg = registries.find(r => r.id === id);
    return reg?.name || id;
  }

  function isValid(recognition: Recognition): boolean {
    const now = new Date();
    if (recognition.validFrom && new Date(recognition.validFrom) > now) return false;
    if (recognition.validUntil && new Date(recognition.validUntil) < now) return false;
    return recognition.recognized;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Link2 class="h-7 w-7" /></div>
        Recognitions
      </h1>
      <p class="text-muted-foreground mt-1">Manage inter-registry trust relationships</p>
    </div>
    <a href="/recognitions/new" class="btn-default flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Create Recognition
    </a>
  </div>

  <!-- Stats -->
  <div class="grid gap-4 md:grid-cols-3">
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Recognitions</p>
            <p class="text-2xl font-bold mt-1">{meta.total}</p>
          </div>
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Link2 class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active</p>
            <p class="text-2xl font-bold mt-1 text-emerald-500">{recognitions.filter(r => isValid(r)).length}</p>
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
            <p class="text-sm text-muted-foreground">Expired/Invalid</p>
            <p class="text-2xl font-bold mt-1 text-amber-500">{recognitions.filter(r => !isValid(r)).length}</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <XCircle class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="card">
    <div class="card-content p-4">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-1">Authority Registry</label>
          <select bind:value={filterAuthorityId} class="input w-full">
            <option value="">All Registries</option>
            {#each registries as reg}
              <option value={reg.id}>{reg.name}</option>
            {/each}
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-1">Entity ID</label>
          <input type="text" bind:value={filterEntityId} placeholder="did:web:..." class="input w-full" />
        </div>
        <div class="flex gap-2">
          <button onclick={applyFilters} class="btn-default">Apply</button>
          <button onclick={clearFilters} class="btn-outline">Clear</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  {#if loading}
    <div class="card">
      <div class="card-content p-6">
        <div class="space-y-4">
          {#each Array(5) as _}
            <div class="h-16 animate-pulse rounded bg-muted"></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if recognitions.length === 0}
    <div class="card">
      <div class="card-content p-12">
        <div class="text-center">
          <div class="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-500 mb-4">
            <Link2 class="h-12 w-12" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No recognitions</h3>
          <p class="text-muted-foreground mb-6">Create your first inter-registry recognition.</p>
          <a href="/recognitions/new" class="btn-default inline-flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Create Recognition
          </a>
        </div>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Authority</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Entity</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Action</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Resource</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Validity</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each recognitions as recognition}
              <tr class="group hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium">{recognition.authority?.name || 'Unknown'}</p>
                    <p class="text-xs text-muted-foreground font-mono">{recognition.authority?.ecosystemDid}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs">{recognition.entityId}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="badge-secondary">{recognition.action}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm">{recognition.resource}</span>
                </td>
                <td class="px-6 py-4">
                  {#if isValid(recognition)}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 class="h-3 w-3" /> Active
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                      <XCircle class="h-3 w-3" /> Invalid
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <div class="text-xs text-muted-foreground">
                    {#if recognition.validFrom || recognition.validUntil}
                      <div class="flex items-center gap-1">
                        <Calendar class="h-3 w-3" />
                        {recognition.validFrom ? new Date(recognition.validFrom).toLocaleDateString() : '∞'}
                        →
                        {recognition.validUntil ? new Date(recognition.validUntil).toLocaleDateString() : '∞'}
                      </div>
                    {:else}
                      <span>No expiry</span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href="/recognitions/{recognition.id}" class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-primary">
                      <Eye class="h-4 w-4" />
                    </a>
                    <button onclick={() => deleteRecognition(recognition.id)} class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    {#if meta.totalPages > 1}
      <div class="card">
        <div class="card-content p-4">
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={handlePageChange} />
        </div>
      </div>
    {/if}
  {/if}
</div>
