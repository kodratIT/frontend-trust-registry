<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    ArrowLeft, Shield, Database, Globe, ExternalLink, Clock, Edit, Save, X, 
    CheckCircle2, AlertCircle, FileText, Link as LinkIcon, Plus, Loader2, Info
  } from 'lucide-svelte';
  import { trustFrameworkApi } from '$lib/api';
  import type { TrustFramework } from '$lib/types';
  import { notifications } from '$lib/stores';

  let framework = $state<TrustFramework | null>(null);
  let loading = $state(true);
  let editMode = $state(false);
  let saving = $state(false);

  // Edit form state
  let editName = $state('');
  let editVersion = $state('');
  let editDescription = $state('');
  let editGovernanceUrl = $state('');
  let editStatus = $state<'active' | 'inactive' | 'deprecated'>('active');
  let editJurisdictions = $state<string[]>([]);
  let newJurisdiction = $state('');

  const id = $derived($page.params.id ?? '');

  onMount(async () => {
    if (id) await loadFramework();
  });

  async function loadFramework() {
    if (!id) return;
    loading = true;
    try {
      const response = await trustFrameworkApi.get(id);
      framework = response.data;
      initEditForm();
    } catch (error: any) {
      if (error.response?.status === 404) {
        notifications.error('Trust Framework not found');
        goto('/trust-frameworks');
      } else {
        notifications.error('Failed to load trust framework');
      }
    } finally {
      loading = false;
    }
  }

  function initEditForm() {
    if (!framework) return;
    editName = framework.name;
    editVersion = framework.version;
    editDescription = framework.description || '';
    editGovernanceUrl = framework.governanceFrameworkUrl || '';
    editStatus = framework.status;
    editJurisdictions = framework.jurisdictions ? [...framework.jurisdictions] : [];
  }

  function toggleEditMode() {
    if (editMode) {
      initEditForm(); // Reset form
    }
    editMode = !editMode;
  }

  async function handleSave() {
    if (!framework) return;
    
    saving = true;
    try {
      await trustFrameworkApi.update(framework.id, {
        name: editName.trim(),
        version: editVersion.trim(),
        description: editDescription.trim() || undefined,
        governanceFrameworkUrl: editGovernanceUrl.trim() || undefined,
        status: editStatus,
        jurisdictions: editJurisdictions.length > 0 ? editJurisdictions : undefined,
      });
      
      notifications.success('Trust framework updated successfully');
      await loadFramework();
      editMode = false;
    } catch (error) {
      notifications.error('Failed to update trust framework');
    } finally {
      saving = false;
    }
  }

  function addJurisdiction() {
    if (newJurisdiction.trim() && !editJurisdictions.includes(newJurisdiction.trim())) {
      editJurisdictions = [...editJurisdictions, newJurisdiction.trim().toUpperCase()];
      newJurisdiction = '';
    }
  }

  function removeJurisdiction(j: string) {
    editJurisdictions = editJurisdictions.filter(x => x !== j);
  }

  function formatDate(date: string | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
  {#if loading}
    <div class="flex items-center justify-center min-h-[400px]">
      <Loader2 class="h-8 w-8 animate-spin text-violet-500" />
    </div>
  {:else if framework}
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <a 
            href="/trust-frameworks" 
            class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft class="h-5 w-5" />
          </a>
          <div class="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <Shield class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{framework.name}</h1>
            <p class="text-muted-foreground mt-1">Version {framework.version}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-14 sm:ml-0">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full {getStatusColor(framework.status)}">
          {#if framework.status === 'active'}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm font-medium capitalize">{framework.status}</span>
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
      <div class="card border-violet-500/20 bg-violet-500/5">
        <div class="card-content p-4">
          <div class="flex gap-3">
            <Info class="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium">Edit Mode</p>
              <p class="text-sm text-muted-foreground mt-1">
                Make changes to the trust framework details below. Click Save to apply changes or Cancel to discard.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="space-y-6">
        <!-- Basic Information -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Basic Information</h3>
          </div>
          <div class="card-content p-6 space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm font-medium">Framework Name *</label>
                <input
                  type="text"
                  bind:value={editName}
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Version *</label>
                <input
                  type="text"
                  bind:value={editVersion}
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Description</label>
              <textarea
                bind:value={editDescription}
                rows="4"
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Status</label>
              <select 
                bind:value={editStatus}
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Governance & Jurisdictions -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Governance & Compliance</h3>
          </div>
          <div class="card-content p-6 space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Governance Framework URL</label>
              <input
                type="url"
                bind:value={editGovernanceUrl}
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Jurisdictions</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={newJurisdiction}
                  placeholder="Enter jurisdiction code"
                  class="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addJurisdiction())}
                />
                <button type="button" onclick={addJurisdiction} class="px-4 py-2 rounded-lg border hover:bg-muted">
                  <Plus class="h-4 w-4" />
                </button>
              </div>
              {#if editJurisdictions.length > 0}
                <div class="flex flex-wrap gap-2 mt-3 p-4 rounded-lg bg-muted/50">
                  {#each editJurisdictions as j}
                    <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm font-medium border">
                      {j}
                      <button type="button" onclick={() => removeJurisdiction(j)} class="text-muted-foreground hover:text-destructive">
                        <X class="h-3 w-3" />
                      </button>
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card">
          <div class="card-content p-6">
            <div class="flex gap-3 justify-end">
              <button onclick={toggleEditMode} class="btn-outline flex items-center gap-2">
                <X class="h-4 w-4" />
                Cancel
              </button>
              <button onclick={handleSave} disabled={saving} class="btn-default flex items-center gap-2 min-w-[120px] justify-center">
                {#if saving}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Saving...
                {:else}
                  <Save class="h-4 w-4" />
                  Save Changes
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- View Mode -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          {#if framework.description}
            <div class="card">
              <div class="card-content p-6">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                  <FileText class="h-5 w-5 text-violet-500" />
                  Description
                </h3>
                <p class="text-muted-foreground leading-relaxed">{framework.description}</p>
              </div>
            </div>
          {/if}

          <!-- Governance -->
          {#if framework.governanceFrameworkUrl}
            <div class="card">
              <div class="card-content p-6">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                  <LinkIcon class="h-5 w-5 text-violet-500" />
                  Governance Framework
                </h3>
                <a 
                  href={framework.governanceFrameworkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600 transition-colors"
                >
                  <span class="text-sm break-all">{framework.governanceFrameworkUrl}</span>
                  <ExternalLink class="h-4 w-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          {/if}

          <!-- Jurisdictions -->
          {#if framework.jurisdictions && framework.jurisdictions.length > 0}
            <div class="card">
              <div class="card-content p-6">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                  <Globe class="h-5 w-5 text-violet-500" />
                  Jurisdictions
                </h3>
                <div class="flex flex-wrap gap-2">
                  {#each framework.jurisdictions as jurisdiction}
                    <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium">
                      <Globe class="h-3 w-3 text-muted-foreground" />
                      {jurisdiction}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Registries -->
          {#if framework.trustRegistries && framework.trustRegistries.length > 0}
            <div class="card">
              <div class="card-header border-b">
                <h3 class="card-title flex items-center gap-2">
                  <Database class="h-5 w-5 text-violet-500" />
                  Associated Registries
                </h3>
                <p class="card-description">{framework.trustRegistries.length} registries using this framework</p>
              </div>
              <div class="card-content p-6">
                <div class="space-y-3">
                  {#each framework.trustRegistries as registry}
                    <a 
                      href="/registries/{registry.id}"
                      class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Database class="h-4 w-4" />
                      </div>
                      <div class="flex-1">
                        <p class="font-medium group-hover:text-blue-500 transition-colors">{registry.name}</p>
                        {#if registry.ecosystemDid}
                          <p class="text-xs text-muted-foreground font-mono">{registry.ecosystemDid}</p>
                        {/if}
                      </div>
                    </a>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Metadata -->
          <div class="card">
            <div class="card-header border-b">
              <h3 class="card-title">Metadata</h3>
            </div>
            <div class="card-content p-6 space-y-4">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Version</label>
                <p class="mt-1 font-mono font-medium">{framework.version}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Created</label>
                <p class="mt-1 text-sm flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  {formatDate(framework.createdAt)}
                </p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</label>
                <p class="mt-1 text-sm flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  {formatDate(framework.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
