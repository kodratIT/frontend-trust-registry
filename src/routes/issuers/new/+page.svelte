<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Loader2, Plus, X, UserCheck, Info, Shield, Link2, CheckCircle2, Globe, Clock, Building } from 'lucide-svelte';
  import { issuerApi, registryApi, schemaApi } from '$lib/api';
  import type { CreateIssuer, TrustRegistry, CredentialSchema } from '$lib/types';
  import { notifications } from '$lib/stores';

  let loading = $state(false);
  let loadingData = $state(true);
  let registries = $state<TrustRegistry[]>([]);
  let schemas = $state<CredentialSchema[]>([]);
  
  // Form state
  let did = $state('');
  let name = $state('');
  let registryId = $state('');
  let status = $state<'pending' | 'active' | 'suspended' | 'revoked'>('pending');
  let accreditationLevel = $state<'high' | 'medium' | 'low' | ''>('');
  let endpoint = $state('');
  let validFrom = $state('');
  let validUntil = $state('');
  let selectedSchemas = $state<string[]>([]);
  let jurisdictions = $state<Array<{ code: string; name: string }>>([]);
  let newJurisdictionCode = $state('');
  let newJurisdictionName = $state('');

  onMount(async () => {
    try {
      const [regResponse, schemaResponse] = await Promise.all([
        registryApi.list({ limit: 100, status: 'active' }),
        schemaApi.list({ limit: 100 }),
      ]);
      registries = regResponse.data;
      schemas = schemaResponse.data;
    } catch (error) {
      notifications.error('Failed to load data');
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
      const data: CreateIssuer = {
        did: did.trim(),
        name: name.trim() || undefined,
        registryId,
        status,
        accreditationLevel: accreditationLevel || undefined,
        endpoint: endpoint.trim() || undefined,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
        credentialTypes: selectedSchemas.length > 0 ? selectedSchemas : undefined,
        jurisdictions: jurisdictions.length > 0 ? jurisdictions : undefined,
      };

      await issuerApi.create(data);
      notifications.success('Issuer registered successfully');
      goto('/issuers');
    } catch (error: any) {
      if (error.response?.status === 409) {
        notifications.error('An issuer with this DID already exists');
      } else {
        const message = error.response?.data?.message || 'Failed to register issuer';
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

  function toggleSchema(schemaId: string) {
    if (selectedSchemas.includes(schemaId)) {
      selectedSchemas = selectedSchemas.filter(id => id !== schemaId);
    } else {
      selectedSchemas = [...selectedSchemas, schemaId];
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <a 
          href="/issuers" 
          class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="h-5 w-5" />
        </a>
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <UserCheck class="h-6 w-6" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Register Issuer</h1>
      </div>
      <p class="text-muted-foreground ml-14">Register a new credential issuer in the trust ecosystem</p>
    </div>
  </div>

  <!-- Info Banner -->
  <div class="card border-emerald-500/20 bg-emerald-500/5">
    <div class="card-content p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium">About Issuers</p>
          <p class="text-sm text-muted-foreground mt-1">
            Issuers are entities authorized to issue verifiable credentials. They must be registered in a trust registry and can be authorized to issue specific credential types.
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
          <UserCheck class="h-5 w-5 text-emerald-500" />
          Basic Information
        </h3>
        <p class="card-description">Essential details about the issuer</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- DID -->
        <div class="space-y-2">
          <label for="did" class="text-sm font-medium flex items-center gap-2">
            Issuer DID
            <span class="text-destructive">*</span>
          </label>
          <input
            id="did"
            type="text"
            bind:value={did}
            placeholder="did:web:issuer.example.com"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm"
            required
          />
          <p class="text-xs text-muted-foreground">Decentralized identifier for this issuer</p>
        </div>

        <!-- Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium">
            Issuer Name
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="e.g., University of Example"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-muted-foreground">Legal or common name of the issuing organization</p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <label for="status" class="text-sm font-medium">
            Status
          </label>
          <select 
            id="status" 
            bind:value={status} 
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
          <Shield class="h-5 w-5 text-emerald-500" />
          Registry Assignment
        </h3>
        <p class="card-description">Trust registry where this issuer will be registered</p>
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
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select a registry</option>
              {#each registries as registry}
                <option value={registry.id}>{registry.name}</option>
              {/each}
            </select>
          {/if}
          <p class="text-xs text-muted-foreground">Registry that will govern this issuer</p>
        </div>

        <!-- Endpoint -->
        <div class="space-y-2">
          <label for="endpoint" class="text-sm font-medium">
            Endpoint URL
          </label>
          <input
            id="endpoint"
            type="url"
            bind:value={endpoint}
            placeholder="https://issuer.example.com/api"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-muted-foreground">API endpoint for credential issuance (optional)</p>
        </div>
      </div>
    </div>

    <!-- Validity Period Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Clock class="h-5 w-5 text-emerald-500" />
          Validity Period
        </h3>
        <p class="card-description">Time period during which this issuer is authorized</p>
      </div>
      <div class="card-content p-6">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Valid From -->
          <div class="space-y-2">
            <label for="validFrom" class="text-sm font-medium">
              Valid From
            </label>
            <input
              id="validFrom"
              type="datetime-local"
              bind:value={validFrom}
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p class="text-xs text-muted-foreground">Start date of authorization</p>
          </div>

          <!-- Valid Until -->
          <div class="space-y-2">
            <label for="validUntil" class="text-sm font-medium">
              Valid Until
            </label>
            <input
              id="validUntil"
              type="datetime-local"
              bind:value={validUntil}
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p class="text-xs text-muted-foreground">End date of authorization (optional)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Jurisdictions Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Globe class="h-5 w-5 text-emerald-500" />
          Jurisdictions
        </h3>
        <p class="card-description">Geographic regions where this issuer operates</p>
      </div>
      <div class="card-content p-6 space-y-4">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={newJurisdictionCode}
            placeholder="Code (e.g., US)"
            class="w-24 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            bind:value={newJurisdictionName}
            placeholder="Name (e.g., United States)"
            class="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

    <!-- Credential Types Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <Link2 class="h-5 w-5 text-emerald-500" />
          Credential Types
        </h3>
        <p class="card-description">Types of credentials this issuer is authorized to issue (optional)</p>
      </div>
      <div class="card-content p-6">
        {#if loadingData}
          <div class="flex items-center justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        {:else if schemas.length === 0}
          <p class="text-sm text-muted-foreground">
            No credential schemas available. <a href="/schemas/new" class="text-emerald-500 hover:underline">Create schemas first</a>.
          </p>
        {:else}
          <div class="space-y-3">
            <div class="grid gap-3 sm:grid-cols-2 max-h-64 overflow-y-auto p-2 rounded-lg bg-muted/30">
              {#each schemas as schema}
                <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors {selectedSchemas.includes(schema.id) ? 'border-emerald-500 bg-emerald-500/5' : ''}">
                  <input 
                    type="checkbox" 
                    checked={selectedSchemas.includes(schema.id)} 
                    onchange={() => toggleSchema(schema.id)} 
                    class="sr-only" 
                  />
                  <div class="flex items-center justify-center w-5 h-5 rounded border-2 {selectedSchemas.includes(schema.id) ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground'}">
                    {#if selectedSchemas.includes(schema.id)}
                      <CheckCircle2 class="h-3 w-3 text-white" />
                    {/if}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-sm">{schema.name}</p>
                    <p class="text-xs text-muted-foreground">{schema.type} v{schema.version}</p>
                  </div>
                </label>
              {/each}
            </div>
            <p class="text-xs text-muted-foreground">
              Selected: {selectedSchemas.length} credential type{selectedSchemas.length !== 1 ? 's' : ''}
            </p>
          </div>
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
              href="/issuers" 
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
                Register Issuer
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
