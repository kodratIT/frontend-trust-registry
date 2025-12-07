<script lang="ts">
  import { Shield, Search, CheckCircle2, XCircle, Clock, ArrowRight, Zap, Link2 } from 'lucide-svelte';
  import { trqpApi, registryApi } from '$lib/api';
  import type { TRQPAuthorizationResponse, TRQPRecognitionResponse } from '$lib/api';
  import type { TrustRegistry } from '$lib/types';
  import { notifications } from '$lib/stores';
  import { onMount } from 'svelte';

  type QueryType = 'authorization' | 'recognition';

  let queryType = $state<QueryType>('authorization');
  let loading = $state(false);
  let registries = $state<TrustRegistry[]>([]);

  // Form fields
  let entityId = $state('');
  let authorityId = $state('');
  let action = $state('issue');
  let resource = $state('');
  let queryTime = $state('');

  // Results
  let authResult = $state<TRQPAuthorizationResponse | null>(null);
  let recogResult = $state<TRQPRecognitionResponse | null>(null);
  let error = $state<string | null>(null);

  const authActions = ['issue', 'verify'];
  const recogActions = ['recognize', 'govern'];

  onMount(async () => {
    try {
      const res = await registryApi.list({ limit: 100 });
      registries = res.data;
    } catch (e) {
      console.error('Failed to load registries');
    }
  });

  async function executeQuery() {
    if (!entityId || !authorityId || !action || !resource) {
      notifications.error('Please fill all required fields');
      return;
    }

    loading = true;
    error = null;
    authResult = null;
    recogResult = null;

    try {
      const context = queryTime ? { time: new Date(queryTime).toISOString() } : undefined;

      if (queryType === 'authorization') {
        authResult = await trqpApi.authorization({
          entity_id: entityId,
          authority_id: authorityId,
          action,
          resource,
          context,
        });
      } else {
        recogResult = await trqpApi.recognition({
          entity_id: entityId,
          authority_id: authorityId,
          action,
          resource,
          context,
        });
      }
    } catch (e: any) {
      error = e.response?.data?.detail || e.message || 'Query failed';
      notifications.error('Query failed');
    } finally {
      loading = false;
    }
  }

  function clearForm() {
    entityId = '';
    authorityId = '';
    action = queryType === 'authorization' ? 'issue' : 'recognize';
    resource = '';
    queryTime = '';
    authResult = null;
    recogResult = null;
    error = null;
  }

  function switchQueryType(type: QueryType) {
    queryType = type;
    action = type === 'authorization' ? 'issue' : 'recognize';
    authResult = null;
    recogResult = null;
    error = null;
  }

  function selectRegistry(did: string) {
    authorityId = did;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-primary/10 text-primary"><Zap class="h-7 w-7" /></div>
        TRQP Query
      </h1>
      <p class="text-muted-foreground mt-1">Test Trust Registry Query Protocol endpoints</p>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Query Form -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title">Query Builder</h3>
        <p class="card-description">Build and execute TRQP queries</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Query Type Tabs -->
        <div class="inline-flex items-center rounded-lg border bg-muted p-1 w-full">
          <button
            onclick={() => switchQueryType('authorization')}
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all {queryType === 'authorization' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Shield class="h-4 w-4" />
            Authorization
          </button>
          <button
            onclick={() => switchQueryType('recognition')}
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all {queryType === 'recognition' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Link2 class="h-4 w-4" />
            Recognition
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              {queryType === 'authorization' ? 'Entity ID (DID)' : 'Entity ID (Authority DID)'}
              <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              bind:value={entityId}
              placeholder="did:web:example.com"
              class="input w-full"
            />
            <p class="text-xs text-muted-foreground mt-1">
              {queryType === 'authorization' ? 'The issuer/verifier DID to check' : 'The authority DID being recognized'}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Authority ID (Ecosystem DID) <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              bind:value={authorityId}
              placeholder="did:web:registry.example.com"
              class="input w-full"
            />
            {#if registries.length > 0}
              <div class="flex flex-wrap gap-2 mt-2">
                {#each registries.slice(0, 3) as reg}
                  <button
                    type="button"
                    onclick={() => selectRegistry(reg.ecosystemDid)}
                    class="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {reg.name}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Action <span class="text-destructive">*</span></label>
              <select bind:value={action} class="input w-full">
                {#each (queryType === 'authorization' ? authActions : recogActions) as act}
                  <option value={act}>{act}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Resource <span class="text-destructive">*</span></label>
              <input
                type="text"
                bind:value={resource}
                placeholder="UniversityDegree"
                class="input w-full"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Query Time (Optional)</label>
            <input
              type="datetime-local"
              bind:value={queryTime}
              class="input w-full"
            />
            <p class="text-xs text-muted-foreground mt-1">Leave empty for current time</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t">
          <button onclick={executeQuery} disabled={loading} class="btn-default flex-1 flex items-center justify-center gap-2">
            {#if loading}
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            {:else}
              <Search class="h-4 w-4" />
            {/if}
            Execute Query
          </button>
          <button onclick={clearForm} class="btn-outline">Clear</button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title">Query Result</h3>
        <p class="card-description">Response from TRQP endpoint</p>
      </div>
      <div class="card-content p-6">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        {:else if error}
          <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div class="flex items-start gap-3">
              <XCircle class="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p class="font-medium text-destructive">Query Failed</p>
                <p class="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        {:else if authResult}
          <div class="space-y-4">
            <div class="flex items-center gap-3 p-4 rounded-lg {authResult.authorized ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}">
              {#if authResult.authorized}
                <CheckCircle2 class="h-8 w-8 text-emerald-500" />
                <div>
                  <p class="font-semibold text-emerald-500">Authorized</p>
                  <p class="text-sm text-muted-foreground">Entity is authorized for this action</p>
                </div>
              {:else}
                <XCircle class="h-8 w-8 text-red-500" />
                <div>
                  <p class="font-semibold text-red-500">Not Authorized</p>
                  <p class="text-sm text-muted-foreground">Entity is not authorized</p>
                </div>
              {/if}
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Entity</span>
                <span class="font-mono text-xs">{authResult.entity_id}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Authority</span>
                <span class="font-mono text-xs">{authResult.authority_id}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Action</span>
                <span class="badge-secondary">{authResult.action}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Resource</span>
                <span class="badge-secondary">{authResult.resource}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Evaluated At</span>
                <span class="flex items-center gap-1"><Clock class="h-3 w-3" />{new Date(authResult.time_evaluated).toLocaleString()}</span>
              </div>
              {#if authResult.message}
                <div class="pt-2">
                  <span class="text-muted-foreground">Message</span>
                  <p class="mt-1 p-3 rounded bg-muted text-xs">{authResult.message}</p>
                </div>
              {/if}
            </div>
          </div>
        {:else if recogResult}
          <div class="space-y-4">
            <div class="flex items-center gap-3 p-4 rounded-lg {recogResult.recognized ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}">
              {#if recogResult.recognized}
                <CheckCircle2 class="h-8 w-8 text-emerald-500" />
                <div>
                  <p class="font-semibold text-emerald-500">Recognized</p>
                  <p class="text-sm text-muted-foreground">Entity is recognized by authority</p>
                </div>
              {:else}
                <XCircle class="h-8 w-8 text-red-500" />
                <div>
                  <p class="font-semibold text-red-500">Not Recognized</p>
                  <p class="text-sm text-muted-foreground">Entity is not recognized</p>
                </div>
              {/if}
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Entity</span>
                <span class="font-mono text-xs">{recogResult.entity_id}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Authority</span>
                <span class="font-mono text-xs">{recogResult.authority_id}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Action</span>
                <span class="badge-secondary">{recogResult.action}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Resource</span>
                <span class="badge-secondary">{recogResult.resource}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Evaluated At</span>
                <span class="flex items-center gap-1"><Clock class="h-3 w-3" />{new Date(recogResult.time_evaluated).toLocaleString()}</span>
              </div>
              {#if recogResult.message}
                <div class="pt-2">
                  <span class="text-muted-foreground">Message</span>
                  <p class="mt-1 p-3 rounded bg-muted text-xs">{recogResult.message}</p>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-center py-12">
            <Search class="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p class="text-muted-foreground">Execute a query to see results</p>
            <p class="text-xs text-muted-foreground mt-2">Fill the form and click "Execute Query"</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Info Cards -->
  <div class="grid gap-4 md:grid-cols-2">
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-violet-500/10 text-violet-500">
            <Shield class="h-6 w-6" />
          </div>
          <div>
            <h4 class="font-semibold">Authorization Query</h4>
            <p class="text-sm text-muted-foreground mt-1">
              Check if an entity (issuer/verifier) is authorized to perform an action on a resource within an ecosystem.
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              <code class="bg-muted px-1 rounded">POST /v2/authorization</code>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Link2 class="h-6 w-6" />
          </div>
          <div>
            <h4 class="font-semibold">Recognition Query</h4>
            <p class="text-sm text-muted-foreground mt-1">
              Check if an authority recognizes another entity as an authority for specific actions and resources.
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              <code class="bg-muted px-1 rounded">POST /v2/recognition</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
