<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Code, Database, Shield, Clock, Copy, Check, FileJson, Loader2, Building } from 'lucide-svelte';
  import { schemaApi } from '$lib/api';
  import type { CredentialSchema } from '$lib/types';
  import { notifications } from '$lib/stores';

  let schema = $state<CredentialSchema | null>(null);
  let loading = $state(true);
  let copied = $state(false);

  const id = $derived($page.params.id ?? '');

  onMount(async () => {
    if (id) await loadSchema();
  });

  async function loadSchema() {
    if (!id) return;
    loading = true;
    try {
      const response = await schemaApi.get(id);
      schema = response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        notifications.error('Schema not found');
        goto('/schemas');
      } else {
        notifications.error('Failed to load schema');
      }
    } finally {
      loading = false;
    }
  }

  async function copySchema() {
    if (!schema) return;
    await navigator.clipboard.writeText(JSON.stringify(schema.jsonSchema, null, 2));
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function formatDate(date: string | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex items-center justify-center min-h-[400px]">
      <Loader2 class="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  {:else if schema}
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <a href="/schemas" class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft class="h-5 w-5" />
          </a>
          <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <FileJson class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{schema.name}</h1>
            <p class="text-muted-foreground mt-1">{schema.type} v{schema.version}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Schema Information -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <FileJson class="h-5 w-5 text-cyan-500" />
              Schema Information
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Name</label>
                <p class="mt-1 font-medium">{schema.name}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Version</label>
                <p class="font-mono mt-1">{schema.version}</p>
              </div>
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Credential Type</label>
                <code class="block text-sm bg-muted px-3 py-2 rounded-lg mt-1 font-mono">{schema.type}</code>
              </div>
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Registry</label>
                <p class="mt-1">
                  {#if schema.registry}
                    <a href="/registries/{schema.registry.id}" class="text-blue-500 hover:text-blue-600 flex items-center gap-2">
                      <Database class="h-4 w-4" />
                      {schema.registry.name}
                    </a>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Modes -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Shield class="h-5 w-5 text-cyan-500" />
              Trust Modes
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Issuer Mode</label>
                <div class="mt-2">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize {schema.issuerMode === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : schema.issuerMode === 'ECOSYSTEM' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}">
                    {schema.issuerMode}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mt-2">
                  {#if schema.issuerMode === 'OPEN'}
                    Any issuer can issue this credential type
                  {:else if schema.issuerMode === 'ECOSYSTEM'}
                    Only ecosystem members can issue
                  {:else}
                    Requires explicit authorization from grantor
                  {/if}
                </p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Verifier Mode</label>
                <div class="mt-2">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize {schema.verifierMode === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : schema.verifierMode === 'ECOSYSTEM' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}">
                    {schema.verifierMode}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mt-2">
                  {#if schema.verifierMode === 'OPEN'}
                    Any verifier can verify this credential type
                  {:else if schema.verifierMode === 'ECOSYSTEM'}
                    Only ecosystem members can verify
                  {:else}
                    Requires explicit authorization from grantor
                  {/if}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- JSON Schema -->
        <div class="card">
          <div class="card-header border-b">
            <div class="flex items-center justify-between">
              <h3 class="card-title flex items-center gap-2">
                <Code class="h-5 w-5 text-cyan-500" />
                JSON Schema Definition
              </h3>
              <button onclick={copySchema} class="btn-outline text-sm flex items-center gap-2">
                {#if copied}
                  <Check class="w-4 h-4 text-emerald-500" />
                  Copied!
                {:else}
                  <Copy class="w-4 h-4" />
                  Copy
                {/if}
              </button>
            </div>
          </div>
          <div class="card-content p-6">
            <pre class="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-96 border">{JSON.stringify(schema.jsonSchema, null, 2)}</pre>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        {#if schema.trustFramework}
          <div class="card">
            <div class="card-header border-b">
              <h3 class="card-title">Trust Framework</h3>
            </div>
            <div class="card-content p-6">
              <a href="/trust-frameworks/{schema.trustFramework.id}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div class="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <Shield class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-medium group-hover:text-violet-500 transition-colors">{schema.trustFramework.name}</p>
                  <p class="text-xs text-muted-foreground">v{schema.trustFramework.version}</p>
                </div>
              </a>
            </div>
          </div>
        {/if}

        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Metadata</h3>
          </div>
          <div class="card-content p-6 space-y-4">
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Created</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(schema.createdAt)}
              </p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(schema.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
