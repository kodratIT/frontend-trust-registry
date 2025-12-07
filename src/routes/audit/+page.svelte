<script lang="ts">
  import { onMount } from 'svelte';
  import { ClipboardList, Filter, RefreshCw, Loader2 } from 'lucide-svelte';
  import { auditApi } from '$lib/api';
  import type { AuditLog, PaginationMeta } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Pagination from '$lib/components/common/Pagination.svelte';

  let logs = $state<AuditLog[]>([]);
  let meta = $state<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  let loading = $state(true);
  let page = $state(1);
  
  // Filters
  let actionFilter = $state('');
  let resourceTypeFilter = $state('');
  let resultFilter = $state('');

  async function loadLogs() {
    loading = true;
    try {
      const response = await auditApi.list({ 
        page, 
        limit: 20,
        action: actionFilter as 'create' | 'read' | 'update' | 'delete' | undefined,
        resourceType: resourceTypeFilter || undefined,
        result: resultFilter as 'success' | 'failure' | undefined,
      });
      logs = response.data;
      meta = response.meta;
    } catch (error) {
      notifications.error('Failed to load audit logs');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadLogs();
  });

  function handlePageChange(newPage: number) {
    page = newPage;
    loadLogs();
  }

  function handleFilterChange() {
    page = 1;
    loadLogs();
  }

  function getActionColor(action: string): string {
    switch (action) {
      case 'create': return 'text-emerald-500 bg-emerald-500/10';
      case 'update': return 'text-blue-500 bg-blue-500/10';
      case 'delete': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-orange-500/10 text-orange-500"><ClipboardList class="h-7 w-7" /></div>
        Audit Logs
      </h1>
      <p class="text-muted-foreground mt-1">Track all operations performed in the trust registry</p>
    </div>
    <button onclick={loadLogs} class="btn-default flex items-center gap-2">
      <RefreshCw class="w-4 h-4" />
      Refresh
    </button>
  </div>

  <!-- Filters -->
  <div class="card">
    <div class="card-content p-4">
      <div class="flex flex-wrap items-center gap-4">
        <Filter class="w-5 h-5 text-muted-foreground" />
        
        <select 
          bind:value={actionFilter}
          onchange={handleFilterChange}
          class="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="read">Read</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>

        <select 
          bind:value={resourceTypeFilter}
          onchange={handleFilterChange}
          class="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="">All Resources</option>
          <option value="trust-frameworks">Trust Frameworks</option>
          <option value="registries">Registries</option>
          <option value="issuers">Issuers</option>
          <option value="verifiers">Verifiers</option>
          <option value="schemas">Schemas</option>
        </select>

        <select 
          bind:value={resultFilter}
          onchange={handleFilterChange}
          class="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="">All Results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Logs Table -->
  <div class="card">
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-orange-500" />
      </div>
    {:else if logs.length === 0}
      <div class="card-content p-12">
        <div class="text-center">
          <div class="inline-flex p-4 rounded-full bg-orange-500/10 text-orange-500 mb-4">
            <ClipboardList class="h-12 w-12" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No audit logs</h3>
          <p class="text-muted-foreground">Audit logs will appear here as operations are performed.</p>
        </div>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Timestamp</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Actor</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Action</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Resource</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Result</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each logs as log}
              <tr class="hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-sm">{log.actor}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase {getActionColor(log.action)}">
                    {log.action}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <span class="text-sm font-medium">{log.resourceType}</span>
                    {#if log.resourceId}
                      <p class="text-xs text-muted-foreground font-mono truncate max-w-xs mt-1">{log.resourceId}</p>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4">
                  {#if log.result === 'success'}
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      Success
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                      Failed
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  {#if log.details}
                    <button class="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                      View
                    </button>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      {#if meta.totalPages > 1}
        <div class="border-t">
          <div class="p-4">
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
</div>
