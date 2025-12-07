<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    ArrowLeft, Database, Shield, Link2, Clock, Edit, Save, X, 
    CheckCircle2, AlertCircle, Loader2, Info, Building, UserCheck, UserCog, FileJson
  } from 'lucide-svelte';
  import { registryApi, trustFrameworkApi } from '$lib/api';
  import type { TrustRegistry, TrustFramework } from '$lib/types';
  import { notifications } from '$lib/stores';

  let registry = $state<TrustRegistry | null>(null);
  let frameworks = $state<TrustFramework[]>([]);
  let loading = $state(true);
  let loadingFrameworks = $state(false);
  let editMode = $state(false);
  let saving = $state(false);

  // Edit form state
  let editName = $state('');
  let editDescription = $state('');
  let editEcosystemDid = $state('');
  let editTrustFrameworkId = $state('');
  let editGovernanceAuthority = $state('');
  let editStatus = $state<'active' | 'inactive' | 'deprecated'>('active');

  const id = $derived($page.params.id ?? '');

  onMount(async () => {
    if (id) await loadRegistry();
  });

  async function loadRegistry() {
    if (!id) return;
    loading = true;
    try {
      const response = await registryApi.get(id);
      registry = response.data;
      initEditForm();
    } catch (error: any) {
      if (error.response?.status === 404) {
        notifications.error('Trust Registry not found');
        goto('/registries');
      } else {
        notifications.error('Failed to load trust registry');
      }
    } finally {
      loading = false;
    }
  }

  async function loadFrameworks() {
    loadingFrameworks = true;
    try {
      const response = await trustFrameworkApi.list({ limit: 100 });
      frameworks = response.data.filter((f: TrustFramework) => f.status === 'active');
    } catch (error) {
      notifications.error('Failed to load trust frameworks');
    } finally {
      loadingFrameworks = false;
    }
  }

  function initEditForm() {
    if (!registry) return;
    editName = registry.name;
    editDescription = registry.description || '';
    editEcosystemDid = registry.ecosystemDid;
    editTrustFrameworkId = registry.trustFrameworkId || '';
    editGovernanceAuthority = registry.governanceAuthority || '';
    editStatus = registry.status;
  }

  async function toggleEditMode() {
    if (!editMode) {
      await loadFrameworks();
    } else {
      initEditForm();
    }
    editMode = !editMode;
  }

  async function handleSave() {
    if (!registry) return;
    
    saving = true;
    try {
      await registryApi.update(registry.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        trustFrameworkId: editTrustFrameworkId || undefined,
        governanceAuthority: editGovernanceAuthority.trim() || undefined,
        status: editStatus,
      });
      
      notifications.success('Trust registry updated successfully');
      await loadRegistry();
      editMode = false;
    } catch (error) {
      notifications.error('Failed to update trust registry');
    } finally {
      saving = false;
    }
  }

  function formatDate(date: string | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
  {#if loading}
    <div class="flex items-center justify-center min-h-[400px]">
      <Loader2 class="h-8 w-8 animate-spin text-blue-500" />
    </div>
  {:else if registry}
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <a href="/registries" class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft class="h-5 w-5" />
          </a>
          <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Database class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{registry.name}</h1>
            <p class="text-muted-foreground mt-1 font-mono text-sm">{registry.ecosystemDid}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-14 sm:ml-0">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full {getStatusColor(registry.status)}">
          {#if registry.status === 'active'}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm font-medium capitalize">{registry.status}</span>
        </div>
        {#if !editMode}
          <button onclick={toggleEditMode} class="btn-default flex items-center gap-2">
            <Edit class="h-4 w-4" />
            Edit
          </button>
        {/if}
      </div>
    </div>

    {#if editMode}
      <!-- Edit Mode -->
      <div class="card border-blue-500/20 bg-blue-500/5">
        <div class="card-content p-4">
          <div class="flex gap-3">
            <Info class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium">Edit Mode</p>
              <p class="text-sm text-muted-foreground mt-1">Make changes to the trust registry details below.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Basic Information</h3>
          </div>
          <div class="card-content p-6 space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Registry Name *</label>
              <input type="text" bind:value={editName} class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Description</label>
              <textarea bind:value={editDescription} rows="4" class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Status</label>
              <select bind:value={editStatus} class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Governance</h3>
          </div>
          <div class="card-content p-6 space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Trust Framework</label>
              {#if loadingFrameworks}
                <div class="w-full px-4 py-2 rounded-lg border bg-muted animate-pulse"><div class="h-5 w-32 bg-muted-foreground/20 rounded"></div></div>
              {:else}
                <select bind:value={editTrustFrameworkId} class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">None</option>
                  {#each frameworks as framework}
                    <option value={framework.id}>{framework.name} v{framework.version}</option>
                  {/each}
                </select>
              {/if}
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Governance Authority</label>
              <input type="text" bind:value={editGovernanceAuthority} class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-content p-6">
            <div class="flex gap-3 justify-end">
              <button onclick={toggleEditMode} class="btn-outline flex items-center gap-2"><X class="h-4 w-4" />Cancel</button>
              <button onclick={handleSave} disabled={saving} class="btn-default flex items-center gap-2 min-w-[120px] justify-center">
                {#if saving}<Loader2 class="h-4 w-4 animate-spin" />Saving...{:else}<Save class="h-4 w-4" />Save Changes{/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- View Mode -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          {#if registry.description}
            <div class="card"><div class="card-content p-6"><h3 class="font-semibold mb-3 flex items-center gap-2"><Building class="h-5 w-5 text-blue-500" />Description</h3><p class="text-muted-foreground leading-relaxed">{registry.description}</p></div></div>
          {/if}

          {#if registry.trustFramework}
            <div class="card"><div class="card-content p-6"><h3 class="font-semibold mb-3 flex items-center gap-2"><Shield class="h-5 w-5 text-blue-500" />Trust Framework</h3><a href="/trust-frameworks/{registry.trustFramework.id}" class="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600"><span>{registry.trustFramework.name} v{registry.trustFramework.version}</span></a></div></div>
          {/if}

          {#if registry.governanceAuthority}
            <div class="card"><div class="card-content p-6"><h3 class="font-semibold mb-3 flex items-center gap-2"><Building class="h-5 w-5 text-blue-500" />Governance Authority</h3><p class="text-muted-foreground">{registry.governanceAuthority}</p></div></div>
          {/if}

          <!-- Participants -->
          <div class="card">
            <div class="card-header border-b"><h3 class="card-title">Participants</h3><p class="card-description">{(registry.issuers?.length || 0) + (registry.verifiers?.length || 0)} total participants</p></div>
            <div class="card-content p-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <a href="/issuers?registryId={registry.id}" class="p-4 rounded-lg border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                  <div class="flex items-center gap-3"><div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><UserCheck class="h-5 w-5" /></div><div><p class="text-2xl font-bold">{registry.issuers?.length || 0}</p><p class="text-sm text-muted-foreground">Issuers</p></div></div>
                </a>
                <a href="/verifiers?registryId={registry.id}" class="p-4 rounded-lg border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                  <div class="flex items-center gap-3"><div class="p-2 rounded-lg bg-amber-500/10 text-amber-500"><UserCog class="h-5 w-5" /></div><div><p class="text-2xl font-bold">{registry.verifiers?.length || 0}</p><p class="text-sm text-muted-foreground">Verifiers</p></div></div>
                </a>
              </div>
            </div>
          </div>

          {#if registry.credentialSchemas && registry.credentialSchemas.length > 0}
            <div class="card">
              <div class="card-header border-b"><h3 class="card-title flex items-center gap-2"><FileJson class="h-5 w-5 text-blue-500" />Credential Schemas</h3><p class="card-description">{registry.credentialSchemas.length} schemas</p></div>
              <div class="card-content p-6"><div class="space-y-2">{#each registry.credentialSchemas as schema}<a href="/schemas/{schema.id}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"><div class="p-2 rounded-lg bg-cyan-500/10 text-cyan-500"><FileJson class="h-4 w-4" /></div><div class="flex-1"><p class="font-medium group-hover:text-cyan-500 transition-colors">{schema.name}</p><p class="text-xs text-muted-foreground">{schema.type}</p></div></a>{/each}</div></div>
            </div>
          {/if}
        </div>

        <div class="space-y-6">
          <div class="card">
            <div class="card-header border-b"><h3 class="card-title">Metadata</h3></div>
            <div class="card-content p-6 space-y-4">
              <div><label class="text-xs text-muted-foreground uppercase tracking-wide">Ecosystem DID</label><p class="mt-1 font-mono text-sm break-all">{registry.ecosystemDid}</p></div>
              <div><label class="text-xs text-muted-foreground uppercase tracking-wide">Created</label><p class="mt-1 text-sm flex items-center gap-2"><Clock class="h-4 w-4 text-muted-foreground" />{formatDate(registry.createdAt)}</p></div>
              <div><label class="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</label><p class="mt-1 text-sm flex items-center gap-2"><Clock class="h-4 w-4 text-muted-foreground" />{formatDate(registry.updatedAt)}</p></div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
