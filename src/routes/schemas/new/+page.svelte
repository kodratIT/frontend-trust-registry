<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Loader2, Code, FileJson, Info, Shield, CheckCircle2, Building } from 'lucide-svelte';
  import { schemaApi, registryApi, trustFrameworkApi } from '$lib/api';
  import type { CreateCredentialSchema, TrustRegistry, TrustFramework } from '$lib/types';
  import { notifications } from '$lib/stores';

  let loading = $state(false);
  let loadingData = $state(true);
  let registries = $state<TrustRegistry[]>([]);
  let frameworks = $state<TrustFramework[]>([]);
  
  // Form state
  let name = $state('');
  let version = $state('1.0.0');
  let type = $state('');
  let registryId = $state('');
  let trustFrameworkId = $state('');
  let issuerMode = $state<'OPEN' | 'ECOSYSTEM' | 'GRANTOR'>('OPEN');
  let verifierMode = $state<'OPEN' | 'ECOSYSTEM' | 'GRANTOR'>('OPEN');
  let jsonSchemaText = $state(`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "id": { "type": "string" }
      },
      "required": ["id"]
    }
  },
  "required": ["credentialSubject"]
}`);
  let jsonSchemaError = $state('');

  onMount(async () => {
    try {
      const [regResponse, fwResponse] = await Promise.all([
        registryApi.list({ limit: 100, status: 'active' }),
        trustFrameworkApi.list({ limit: 100, status: 'active' }),
      ]);
      registries = regResponse.data;
      frameworks = fwResponse.data;
    } catch (error) {
      notifications.error('Failed to load data');
    } finally {
      loadingData = false;
    }
  });

  function validateJsonSchema(): boolean {
    try {
      JSON.parse(jsonSchemaText);
      jsonSchemaError = '';
      return true;
    } catch (e) {
      jsonSchemaError = 'Invalid JSON format';
      return false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!name.trim() || !version.trim() || !type.trim() || !registryId) {
      notifications.warning('Name, version, type, and registry are required');
      return;
    }

    if (!validateJsonSchema()) {
      notifications.error('Please fix the JSON Schema errors');
      return;
    }

    loading = true;

    try {
      const data: CreateCredentialSchema = {
        name: name.trim(),
        version: version.trim(),
        type: type.trim(),
        registryId,
        trustFrameworkId: trustFrameworkId || undefined,
        issuerMode,
        verifierMode,
        jsonSchema: JSON.parse(jsonSchemaText),
      };

      await schemaApi.create(data);
      notifications.success('Schema created successfully');
      goto('/schemas');
    } catch (error: any) {
      if (error.response?.status === 409) {
        notifications.error('A schema with this name and version already exists');
      } else {
        const message = error.response?.data?.message || 'Failed to create schema';
        notifications.error(message);
      }
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
          href="/schemas" 
          class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="h-5 w-5" />
        </a>
        <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
          <FileJson class="h-6 w-6" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Create Credential Schema</h1>
      </div>
      <p class="text-muted-foreground ml-14">Define a new credential schema for the trust ecosystem</p>
    </div>
  </div>

  <!-- Info Banner -->
  <div class="card border-cyan-500/20 bg-cyan-500/5">
    <div class="card-content p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium">About Credential Schemas</p>
          <p class="text-sm text-muted-foreground mt-1">
            Credential schemas define the structure and validation rules for verifiable credentials. They specify which fields are required and their data types using JSON Schema format.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Form -->
  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Left Column: Basic Info -->
      <div class="space-y-6">
        <!-- Basic Information Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <FileJson class="h-5 w-5 text-cyan-500" />
              Basic Information
            </h3>
            <p class="card-description">Essential details about the schema</p>
          </div>
          <div class="card-content p-6 space-y-6">
            <!-- Name -->
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium flex items-center gap-2">
                Schema Name
                <span class="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                bind:value={name}
                placeholder="e.g., EducationCredential"
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
              <p class="text-xs text-muted-foreground">Descriptive name for this credential schema</p>
            </div>

            <!-- Version -->
            <div class="space-y-2">
              <label for="version" class="text-sm font-medium flex items-center gap-2">
                Version
                <span class="text-destructive">*</span>
              </label>
              <input
                id="version"
                type="text"
                bind:value={version}
                placeholder="1.0.0"
                pattern="[0-9]+\.[0-9]+\.[0-9]+"
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                required
              />
              <p class="text-xs text-muted-foreground">Semantic versioning (e.g., 1.0.0)</p>
            </div>

            <!-- Type -->
            <div class="space-y-2">
              <label for="type" class="text-sm font-medium flex items-center gap-2">
                Credential Type
                <span class="text-destructive">*</span>
              </label>
              <input
                id="type"
                type="text"
                bind:value={type}
                placeholder="e.g., EducationCredential"
                class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
              <p class="text-xs text-muted-foreground">Type identifier for this credential</p>
            </div>
          </div>
        </div>

        <!-- Registry & Framework Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Building class="h-5 w-5 text-cyan-500" />
              Registry & Framework
            </h3>
            <p class="card-description">Association with registry and trust framework</p>
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
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a registry</option>
                  {#each registries as registry}
                    <option value={registry.id}>{registry.name}</option>
                  {/each}
                </select>
              {/if}
              <p class="text-xs text-muted-foreground">Registry that will manage this schema</p>
            </div>

            <!-- Trust Framework -->
            <div class="space-y-2">
              <label for="framework" class="text-sm font-medium flex items-center gap-2">
                <Shield class="h-4 w-4" />
                Trust Framework
              </label>
              {#if loadingData}
                <div class="w-full px-4 py-2 rounded-lg border bg-muted animate-pulse">
                  <div class="h-5 w-32 bg-muted-foreground/20 rounded"></div>
                </div>
              {:else}
                <select 
                  id="framework" 
                  bind:value={trustFrameworkId} 
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="">None (Optional)</option>
                  {#each frameworks as framework}
                    <option value={framework.id}>{framework.name} v{framework.version}</option>
                  {/each}
                </select>
              {/if}
              <p class="text-xs text-muted-foreground">Link to a governance framework (optional)</p>
            </div>
          </div>
        </div>

        <!-- Trust Modes Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Shield class="h-5 w-5 text-cyan-500" />
              Trust Modes
            </h3>
            <p class="card-description">Authorization requirements for issuers and verifiers</p>
          </div>
          <div class="card-content p-6">
            <div class="grid gap-6 md:grid-cols-2">
              <!-- Issuer Mode -->
              <div class="space-y-2">
                <label for="issuerMode" class="text-sm font-medium">
                  Issuer Mode
                </label>
                <select 
                  id="issuerMode" 
                  bind:value={issuerMode} 
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="OPEN">Open</option>
                  <option value="ECOSYSTEM">Ecosystem</option>
                  <option value="GRANTOR">Grantor</option>
                </select>
                <p class="text-xs text-muted-foreground">
                  {#if issuerMode === 'OPEN'}
                    Any issuer can issue this credential
                  {:else if issuerMode === 'ECOSYSTEM'}
                    Only ecosystem members can issue
                  {:else}
                    Requires explicit authorization
                  {/if}
                </p>
              </div>

              <!-- Verifier Mode -->
              <div class="space-y-2">
                <label for="verifierMode" class="text-sm font-medium">
                  Verifier Mode
                </label>
                <select 
                  id="verifierMode" 
                  bind:value={verifierMode} 
                  class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="OPEN">Open</option>
                  <option value="ECOSYSTEM">Ecosystem</option>
                  <option value="GRANTOR">Grantor</option>
                </select>
                <p class="text-xs text-muted-foreground">
                  {#if verifierMode === 'OPEN'}
                    Any verifier can verify this credential
                  {:else if verifierMode === 'ECOSYSTEM'}
                    Only ecosystem members can verify
                  {:else}
                    Requires explicit authorization
                  {/if}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: JSON Schema -->
      <div class="card lg:row-span-3">
        <div class="card-header border-b">
          <h3 class="card-title flex items-center gap-2">
            <Code class="h-5 w-5 text-cyan-500" />
            JSON Schema Definition
          </h3>
          <p class="card-description">Define the structure using JSON Schema format</p>
        </div>
        <div class="card-content p-6">
          <div class="space-y-2">
            <textarea
              bind:value={jsonSchemaText}
              oninput={validateJsonSchema}
              rows="28"
              class="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono text-sm resize-none {jsonSchemaError ? 'border-destructive' : ''}"
              spellcheck="false"
            ></textarea>
            {#if jsonSchemaError}
              <p class="text-sm text-destructive flex items-center gap-2">
                <Info class="h-4 w-4" />
                {jsonSchemaError}
              </p>
            {:else}
              <p class="text-xs text-muted-foreground">Valid JSON Schema format</p>
            {/if}
          </div>
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
              href="/schemas" 
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
                Create Schema
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
