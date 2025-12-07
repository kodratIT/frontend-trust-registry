<script lang="ts">
  import { Search, Play, Clock, CheckCircle, XCircle, Loader2, Database, User } from 'lucide-svelte';
  import { queryApi } from '$lib/api';
  import type { QueryRequest, QueryResult } from '$lib/types';
  import { notifications } from '$lib/stores';

  let entityType = $state<'issuer' | 'verifier'>('issuer');
  let did = $state('');
  let credentialType = $state('');
  let jurisdiction = $state('');
  let status = $state('active');
  
  let loading = $state(false);
  let result = $state<QueryResult | null>(null);
  let queryHistory = $state<Array<{ query: QueryRequest; result: QueryResult; timestamp: Date }>>([]);

  async function runQuery() {
    if (!entityType) {
      notifications.warning('Please select an entity type');
      return;
    }

    loading = true;
    result = null;

    try {
      const query: QueryRequest = {
        entityType,
        did: did || undefined,
        credentialType: credentialType || undefined,
        jurisdiction: jurisdiction || undefined,
        status: status as QueryRequest['status'] || undefined,
      };

      const response = await queryApi.single(query);
      result = response.data;
      
      // Add to history
      queryHistory = [
        { query, result: response.data, timestamp: new Date() },
        ...queryHistory.slice(0, 9)
      ];

      if (result.found) {
        notifications.success(`Found ${entityType} in ${result.queryTime}ms`);
      } else {
        notifications.info(`No ${entityType} found matching criteria`);
      }
    } catch (error) {
      notifications.error('Query failed');
    } finally {
      loading = false;
    }
  }

  function clearForm() {
    did = '';
    credentialType = '';
    jurisdiction = '';
    status = 'active';
    result = null;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'text-emerald-500 bg-emerald-500/10';
      case 'pending': return 'text-blue-500 bg-blue-500/10';
      case 'suspended': return 'text-amber-500 bg-amber-500/10';
      case 'revoked': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
      <div class="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Search class="h-7 w-7" /></div>
      Query Interface
    </h1>
    <p class="text-muted-foreground mt-1">Test trust resolution queries against the registry</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Query Form -->
    <div class="lg:col-span-2 card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Search class="h-5 w-5 text-purple-500" />
          Query Builder
        </h3>
        <p class="card-description">Build and execute trust resolution queries</p>
      </div>
      <div class="card-content p-6">
        <div class="space-y-6">
          <!-- Entity Type -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Entity Type</label>
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 py-3 px-4 rounded-lg border transition-all {entityType === 'issuer' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-medium' : 'border-muted-foreground/20 hover:border-muted-foreground/40'}"
                onclick={() => entityType = 'issuer'}
              >
                Issuer
              </button>
              <button
                type="button"
                class="flex-1 py-3 px-4 rounded-lg border transition-all {entityType === 'verifier' ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-medium' : 'border-muted-foreground/20 hover:border-muted-foreground/40'}"
                onclick={() => entityType = 'verifier'}
              >
                Verifier
              </button>
            </div>
          </div>

          <!-- DID -->
          <div class="space-y-2">
            <label for="did" class="text-sm font-medium">DID (optional)</label>
            <input
              id="did"
              type="text"
              bind:value={did}
              placeholder="did:web:example.com"
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>

          <!-- Credential Type -->
          <div class="space-y-2">
            <label for="credentialType" class="text-sm font-medium">Credential Type (optional)</label>
            <input
              id="credentialType"
              type="text"
              bind:value={credentialType}
              placeholder="EducationCredential"
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Jurisdiction -->
            <div class="space-y-2">
              <label for="jurisdiction" class="text-sm font-medium">Jurisdiction</label>
              <input
                id="jurisdiction"
                type="text"
                bind:value={jurisdiction}
                placeholder="US, EU, etc."
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <label for="status" class="text-sm font-medium">Status</label>
              <select id="status" bind:value={status} class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                <option value="">Any</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onclick={runQuery}
              disabled={loading}
              class="btn-default flex items-center gap-2 min-w-[140px] justify-center"
            >
              {#if loading}
                <Loader2 class="w-4 h-4 animate-spin" />
                Running...
              {:else}
                <Play class="w-4 h-4" />
                Run Query
              {/if}
            </button>
            <button type="button" onclick={clearForm} class="btn-outline">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Query History -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Clock class="h-5 w-5 text-purple-500" />
          Recent Queries
        </h3>
        <p class="card-description">{queryHistory.length} queries</p>
      </div>
      <div class="card-content p-6">
        {#if queryHistory.length === 0}
          <p class="text-muted-foreground text-sm text-center py-8">No queries yet</p>
        {:else}
          <div class="space-y-3">
            {#each queryHistory as item}
              <div class="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium capitalize">{item.query.entityType}</span>
                  {#if item.result.found}
                    <CheckCircle class="w-4 h-4 text-emerald-500" />
                  {:else}
                    <XCircle class="w-4 h-4 text-muted-foreground" />
                  {/if}
                </div>
                {#if item.query.did}
                  <p class="text-xs text-muted-foreground font-mono truncate">{item.query.did}</p>
                {/if}
                <p class="text-xs text-muted-foreground mt-1">{item.result.queryTime}ms</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Result -->
  {#if result}
    <div class="card">
      <div class="card-header border-b">
        <div class="flex items-center justify-between w-full">
          <h3 class="card-title flex items-center gap-2">
            {#if result.found}
              <CheckCircle class="h-5 w-5 text-emerald-500" />
              Query Result
            {:else}
              <XCircle class="h-5 w-5 text-muted-foreground" />
              No Results
            {/if}
          </h3>
          <span class="text-sm text-muted-foreground">{result.queryTime}ms</span>
        </div>
      </div>
      <div class="card-content p-6">
        {#if result.found && result.entity}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Entity Details</h4>
              <dl class="space-y-3">
                <div>
                  <dt class="text-xs text-muted-foreground">DID</dt>
                  <dd class="font-mono text-sm mt-1">{result.entity.did}</dd>
                </div>
                {#if result.entity.name}
                  <div>
                    <dt class="text-xs text-muted-foreground">Name</dt>
                    <dd class="mt-1">{result.entity.name}</dd>
                  </div>
                {/if}
                <div>
                  <dt class="text-xs text-muted-foreground">Status</dt>
                  <dd class="mt-1">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {getStatusColor(result.entity.status)}">
                      {result.entity.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {#if result.registry}
              <div>
                <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Registry</h4>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs text-muted-foreground">Name</dt>
                    <dd class="mt-1 flex items-center gap-2">
                      <Database class="h-4 w-4 text-muted-foreground" />
                      {result.registry.name}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs text-muted-foreground">Ecosystem DID</dt>
                    <dd class="font-mono text-sm mt-1 text-muted-foreground">{result.registry.ecosystemDid}</dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          {#if result.credentialTypes && result.credentialTypes.length > 0}
            <div class="mt-6 pt-6 border-t">
              <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Credential Types</h4>
              <div class="flex flex-wrap gap-2">
                {#each result.credentialTypes as schema}
                  <span class="px-3 py-1.5 bg-muted rounded-lg text-sm">
                    {schema.name} <span class="text-muted-foreground">v{schema.version}</span>
                  </span>
                {/each}
              </div>
            </div>
          {/if}
        {:else}
          <p class="text-muted-foreground">No {entityType} found matching the specified criteria.</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
