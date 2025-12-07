<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Loader2, Plus, X, UserCog, Info, Shield, Globe, CheckCircle2 } from 'lucide-svelte';
  import { verifierApi, registryApi } from '$lib/api';
  import type { CreateVerifier, TrustRegistry } from '$lib/types';
  import { notifications } from '$lib/stores';

  let loading = $state(false);
  let loadingData = $state(true);
  let registries = $state<TrustRegistry[]>([]);
  
  // Form state
  let did = $state('');
  let name = $state('');
  let registryId = $state('');
  let status = $state<'pending' | 'active' | 'suspended' | 'revoked'>('pending');
  let accreditationLevel = $state<'high' | 'medium' | 'low' | ''>('');
  let jurisdictions = $state<Array<{ code: string; name: string }>>([]);
  let newJurisdictionCode = $state('');
  let newJurisdictionName = $state('');

  onMount(async () => {
    try {
      const response = await registryApi.list({ limit: 100, status: 'active' });
      registries = response.data;
    } catch (error) {
      notifications.error('Failed to load registries');
    } finally {
      loadingData = false;
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!did.trim() || !registryId) {
      notifications.warning('DID and Registry are required');
      return;
    }

    loading = true;

    try {
      const data: CreateVerifier = {
        did: did.trim(),
        name: name.trim() || undefined,
        registryId,
        status,
        accreditationLevel: accreditationLevel || undefined,
        jurisdictions: jurisdictions.length > 0 ? jurisdictions : undefined,
      };

      await verifierApi.create(data);
      notifications.success('Verifier registered successfully');
      goto('/verifiers');
    } catch (error: any) {
      if (error.response?.status === 409) {
        notifications.error('A verifier with this DID already exists');
      } else {
        const message = error.response?.data?.message || 'Failed to register verifier';
        notifications.error(message);
      }
    } finally {
      loading = false;
    }
  }

  function addJurisdiction() {
    if (newJurisdictionCode.trim()) {
      jurisdictions = [...jurisdictions, { 
        code: newJurisdictionCode.trim().toUpperCase(), 
        name: newJurisdictionName.trim() || newJurisdictionCode.trim().toUpperCase()
      }];
      newJurisdictionCode = '';
      newJurisdictionName = '';
    }
  }

  function removeJurisdiction(code: string) {
    jurisdictions = jurisdictions.filter(j => j.code !== code);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <a 
          href="/verifiers" 
          class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="h-5 w-5" />
        </a>
        <div class="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <UserCog class="h-6 w-6" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Register Verifier</h1>
      </div>
      <p class="text-muted-foreground ml-14">Register a new credential verifier in the trust ecosystem</p>
    </div>
  </div>

  <!-- Info Banner -->
  <div class="card border-amber-500/20 bg-amber-500/5">
    <div class="card-content p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium">About Verifiers</p>
          <p class="text-sm text-muted-foreground mt-1">
            Verifiers are entities authorized to verify credentials. They must be registered in a trust registry and can be authorized to verify specific credential types.
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
          <UserCog class="h-5 w-5 text-amber-500" />
          Basic Information
        </h3>
        <p class="card-description">Essential details about the verifier</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- DID -->
        <div class="space-y-2">
          <label for="did" class="text-sm font-medium flex items-center gap-2">
            Verifier DID
            <span class="text-destructive">*</span>
          </label>
          <input
            id="did"
            type="text"
            bind:value={did}
            placeholder="did:web:verifier.example.com"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono text-sm"
            required
          />
          <p class="text-xs text-muted-foreground">Decentralized identifier for this verifier</p>
        </div>

        <!-- Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium">
            Verifier Name
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="e.g., Example Employer"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-muted-foreground">Legal or common name of the verifying organization</p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <label for="status" class="text-sm font-medium">
            Status
          </label>
          <select 
            id="status" 
            bind:value={status} 
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="revoked">Revoked</option>
          </select>
          <p class="text-xs text-muted-foreground">Current operational status</p>
        </div>

        <!-- Accreditation Level -->
        <div class="space-y-2">
          <label for="accreditation" class="text-sm font-medium">
            Accreditation Level
          </label>
          <select 
            id="accreditation" 
            bind:value={accreditationLevel} 
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">Not specified</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <p class="text-xs text-muted-foreground">Trust level or accreditation status</p>
        </div>
      </div>
    </div>

    <!-- Registry Assignment Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Shield class="h-5 w-5 text-amber-500" />
          Registry Assignment
        </h3>
        <p class="card-description">Trust registry where this verifier will be registered</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Registry -->
        <div class="space-y-2">
          <label for="registry" class="text-sm font-medium flex items-center gap-2">
            Trust Registry
            <span class="text-destructive">*</span>
          </label>
          {#if loadingData}
            <div class="w-full px-4 py-2 rounded-lg border bg-muted animate-pulse">
              <div class="h-5 w-32 bg-muted-foreground/20 rounded"></div>
            </div>
          {:else if registries.length === 0}
            <div class="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <p class="text-sm text-amber-600">No active registries available. <a href="/registries/new" class="underline hover:text-amber-700">Create one first</a>.</p>
            </div>
          {:else}
            <select 
              id="registry" 
              bind:value={registryId} 
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select a registry</option>
              {#each registries as registry}
                <option value={registry.id}>{registry.name}</option>
              {/each}
            </select>
          {/if}
          <p class="text-xs text-muted-foreground">Registry that will govern this verifier</p>
        </div>
      </div>
    </div>

    <!-- Jurisdictions Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Globe class="h-5 w-5 text-amber-500" />
          Jurisdictions
        </h3>
        <p class="card-description">Geographic regions where this verifier operates</p>
      </div>
      <div class="card-content p-6 space-y-4">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={newJurisdictionCode}
            placeholder="Code (e.g., US)"
            class="w-24 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            bind:value={newJurisdictionName}
            placeholder="Name (e.g., United States)"
            class="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addJurisdiction())}
          />
          <button 
            type="button" 
            onclick={addJurisdiction} 
            class="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
          >
            <Plus class="h-4 w-4" />
          </button>
        </div>
        
        {#if jurisdictions.length > 0}
          <div class="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/50">
            {#each jurisdictions as j}
              <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm font-medium border">
                <Globe class="h-3 w-3 text-muted-foreground" />
                {j.code} - {j.name}
                <button 
                  type="button" 
                  onclick={() => removeJurisdiction(j.code)} 
                  class="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">No jurisdictions added yet</p>
        {/if}
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
              href="/verifiers" 
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
                Registering...
              {:else}
                <CheckCircle2 class="h-4 w-4" />
                Register Verifier
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
