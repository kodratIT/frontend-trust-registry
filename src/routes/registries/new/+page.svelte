<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ArrowLeft, Save, Loader2, Database, Info, Link2, Shield, CheckCircle2, Building } from 'lucide-svelte';
  import { registryApi, trustFrameworkApi } from '$lib/api';
  import type { CreateTrustRegistry, TrustFramework } from '$lib/types';
  import { notifications } from '$lib/stores';

  let loading = $state(false);
  let loadingFrameworks = $state(true);
  let frameworks = $state<TrustFramework[]>([]);
  
  // Form state
  let name = $state('');
  let description = $state('');
  let ecosystemDid = $state('');
  let trustFrameworkId = $state('');
  let governanceAuthority = $state('');
  let status = $state<'active' | 'inactive' | 'deprecated'>('active');

  onMount(async () => {
    try {
      const response = await trustFrameworkApi.list({ limit: 100 });
      frameworks = response.data.filter((f: TrustFramework) => f.status === 'active');
    } catch (error) {
      notifications.error('Failed to load trust frameworks');
    } finally {
      loadingFrameworks = false;
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!name.trim() || !ecosystemDid.trim()) {
      notifications.warning('Name and Ecosystem DID are required');
      return;
    }

    loading = true;

    try {
      const data: CreateTrustRegistry = {
        name: name.trim(),
        description: description.trim() || undefined,
        ecosystemDid: ecosystemDid.trim(),
        trustFrameworkId: trustFrameworkId || undefined,
        governanceAuthority: governanceAuthority.trim() || undefined,
        status,
      };

      await registryApi.create(data);
      notifications.success('Trust registry created successfully');
      goto('/registries');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create trust registry';
      notifications.error(message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <a 
          href="/registries" 
          class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="h-5 w-5" />
        </a>
        <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <Database class="h-6 w-6" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Create Trust Registry</h1>
      </div>
      <p class="text-muted-foreground ml-14">Set up a new trust registry for managing participants</p>
    </div>
  </div>

  <!-- Info Banner -->
  <div class="card border-blue-500/20 bg-blue-500/5">
    <div class="card-content p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium">About Trust Registries</p>
          <p class="text-sm text-muted-foreground mt-1">
            Trust registries manage issuers, verifiers, and credential schemas within a trust ecosystem. Each registry is identified by a unique ecosystem DID and can be linked to a trust framework.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Form -->
  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Basic Information Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Building class="h-5 w-5 text-blue-500" />
          Basic Information
        </h3>
        <p class="card-description">Essential details about the trust registry</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium flex items-center gap-2">
            Registry Name
            <span class="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="e.g., Canadian Digital Identity Registry"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <p class="text-xs text-muted-foreground">A clear, descriptive name for your trust registry</p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Describe the purpose and scope of this registry..."
            rows="4"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          ></textarea>
          <p class="text-xs text-muted-foreground">Detailed explanation of the registry's purpose and scope</p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <label for="status" class="text-sm font-medium">
            Status
          </label>
          <select 
            id="status" 
            bind:value={status} 
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deprecated">Deprecated</option>
          </select>
          <p class="text-xs text-muted-foreground">Current operational status</p>
        </div>
      </div>
    </div>

    <!-- DID & Framework Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Link2 class="h-5 w-5 text-blue-500" />
          Ecosystem Identity
        </h3>
        <p class="card-description">Decentralized identifier and framework association</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Ecosystem DID -->
        <div class="space-y-2">
          <label for="ecosystemDid" class="text-sm font-medium flex items-center gap-2">
            Ecosystem DID
            <span class="text-destructive">*</span>
          </label>
          <input
            id="ecosystemDid"
            type="text"
            bind:value={ecosystemDid}
            placeholder="did:web:registry.example.com"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            required
          />
          <p class="text-xs text-muted-foreground">
            Unique decentralized identifier for this registry (e.g., did:web:example.com, did:key:z6Mk...)
          </p>
        </div>

        <!-- Trust Framework -->
        <div class="space-y-2">
          <label for="framework" class="text-sm font-medium flex items-center gap-2">
            <Shield class="h-4 w-4" />
            Trust Framework
          </label>
          {#if loadingFrameworks}
            <div class="w-full px-4 py-2 rounded-lg border bg-muted animate-pulse">
              <div class="h-5 w-32 bg-muted-foreground/20 rounded"></div>
            </div>
          {:else if frameworks.length === 0}
            <div class="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <p class="text-sm text-amber-600">No active trust frameworks available. <a href="/trust-frameworks/new" class="underline hover:text-amber-700">Create one first</a>.</p>
            </div>
          {:else}
            <select 
              id="framework" 
              bind:value={trustFrameworkId} 
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">None (Optional)</option>
              {#each frameworks as framework}
                <option value={framework.id}>{framework.name} v{framework.version}</option>
              {/each}
            </select>
          {/if}
          <p class="text-xs text-muted-foreground">Link this registry to a governance framework (optional)</p>
        </div>
      </div>
    </div>

    <!-- Governance Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Shield class="h-5 w-5 text-blue-500" />
          Governance
        </h3>
        <p class="card-description">Governance authority and policies</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Governance Authority -->
        <div class="space-y-2">
          <label for="governanceAuthority" class="text-sm font-medium">
            Governance Authority
          </label>
          <input
            id="governanceAuthority"
            type="text"
            bind:value={governanceAuthority}
            placeholder="e.g., Digital ID & Authentication Council of Canada"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-muted-foreground">Organization or entity responsible for governance</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="card">
      <div class="card-content p-6">
        <div class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <p class="text-sm text-muted-foreground">
            <span class="text-destructive">*</span> Required fields
          </p>
          <div class="flex gap-3">
            <a 
              href="/registries" 
              class="btn-outline flex items-center gap-2"
            >
              Cancel
            </a>
            <button 
              type="submit" 
              disabled={loading} 
              class="btn-default flex items-center gap-2 min-w-[160px] justify-center"
            >
              {#if loading}
                <Loader2 class="h-4 w-4 animate-spin" />
                Creating...
              {:else}
                <CheckCircle2 class="h-4 w-4" />
                Create Registry
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
