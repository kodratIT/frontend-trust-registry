<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowLeft, Save, Loader2, Plus, X, Shield, Info, Globe, FileText, Link as LinkIcon, CheckCircle2 } from 'lucide-svelte';
  import { trustFrameworkApi } from '$lib/api';
  import type { CreateTrustFramework } from '$lib/types';
  import { notifications } from '$lib/stores';

  let loading = $state(false);
  
  // Form state
  let name = $state('');
  let version = $state('1.0');
  let description = $state('');
  let governanceFrameworkUrl = $state('');
  let status = $state<'active' | 'inactive' | 'deprecated'>('active');
  let jurisdictions = $state<string[]>([]);
  let newJurisdiction = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!name.trim() || !version.trim()) {
      notifications.warning('Name and version are required');
      return;
    }

    loading = true;

    try {
      const data: CreateTrustFramework = {
        name: name.trim(),
        version: version.trim(),
        description: description.trim() || undefined,
        governanceFrameworkUrl: governanceFrameworkUrl.trim() || undefined,
        status,
        jurisdictions: jurisdictions.length > 0 ? jurisdictions : undefined,
      };

      await trustFrameworkApi.create(data);
      notifications.success('Trust framework created successfully');
      goto('/trust-frameworks');
    } catch (error) {
      notifications.error('Failed to create trust framework');
    } finally {
      loading = false;
    }
  }

  function addJurisdiction() {
    if (newJurisdiction.trim() && !jurisdictions.includes(newJurisdiction.trim())) {
      jurisdictions = [...jurisdictions, newJurisdiction.trim().toUpperCase()];
      newJurisdiction = '';
    }
  }

  function removeJurisdiction(j: string) {
    jurisdictions = jurisdictions.filter(x => x !== j);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
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
        <h1 class="text-3xl font-bold tracking-tight">Create Trust Framework</h1>
      </div>
      <p class="text-muted-foreground ml-14">Define a new governance framework for your trust ecosystem</p>
    </div>
  </div>

  <!-- Info Banner -->
  <div class="card border-violet-500/20 bg-violet-500/5">
    <div class="card-content p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium">About Trust Frameworks</p>
          <p class="text-sm text-muted-foreground mt-1">
            Trust frameworks establish governance rules and policies for your trust ecosystem. They define how trust registries, issuers, and verifiers operate within your network.
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
          <FileText class="h-5 w-5 text-violet-500" />
          Basic Information
        </h3>
        <p class="card-description">Essential details about the trust framework</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium flex items-center gap-2">
            Framework Name
            <span class="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="e.g., Pan-Canadian Trust Framework"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            required
          />
          <p class="text-xs text-muted-foreground">A clear, descriptive name for your trust framework</p>
        </div>

        <!-- Version & Status Row -->
        <div class="grid gap-6 md:grid-cols-2">
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
              placeholder="1.0"
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
            <p class="text-xs text-muted-foreground">Semantic version number</p>
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <label for="status" class="text-sm font-medium">
              Status
            </label>
            <select 
              id="status" 
              bind:value={status} 
              class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <p class="text-xs text-muted-foreground">Current operational status</p>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Describe the purpose, scope, and key features of this trust framework..."
            rows="4"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
          ></textarea>
          <p class="text-xs text-muted-foreground">Detailed explanation of the framework's purpose and scope</p>
        </div>
      </div>
    </div>

    <!-- Governance & Compliance Card -->
    <div class="card">
      <div class="card-header border-b">
        <h3 class="card-title flex items-center gap-2">
          <LinkIcon class="h-5 w-5 text-violet-500" />
          Governance & Compliance
        </h3>
        <p class="card-description">Legal and regulatory information</p>
      </div>
      <div class="card-content p-6 space-y-6">
        <!-- Governance URL -->
        <div class="space-y-2">
          <label for="governanceUrl" class="text-sm font-medium">
            Governance Framework URL
          </label>
          <input
            id="governanceUrl"
            type="url"
            bind:value={governanceFrameworkUrl}
            placeholder="https://example.com/governance-framework.pdf"
            class="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-muted-foreground">Link to the official governance framework document</p>
        </div>

        <!-- Jurisdictions -->
        <div class="space-y-2">
          <label class="text-sm font-medium flex items-center gap-2">
            <Globe class="h-4 w-4" />
            Jurisdictions
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={newJurisdiction}
              placeholder="Enter jurisdiction code (e.g., US, EU, CA)"
              class="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addJurisdiction())}
            />
            <button 
              type="button" 
              onclick={addJurisdiction} 
              class="px-4 py-2 rounded-lg border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Plus class="h-4 w-4" />
              Add
            </button>
          </div>
          <p class="text-xs text-muted-foreground">Geographic regions or countries where this framework applies</p>
          
          {#if jurisdictions.length > 0}
            <div class="flex flex-wrap gap-2 mt-3 p-4 rounded-lg bg-muted/50">
              {#each jurisdictions as j}
                <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm font-medium border">
                  <Globe class="h-3 w-3 text-muted-foreground" />
                  {j}
                  <button 
                    type="button" 
                    onclick={() => removeJurisdiction(j)} 
                    class="text-muted-foreground hover:text-destructive transition-colors"
                  >
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
        <div class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <p class="text-sm text-muted-foreground">
            <span class="text-destructive">*</span> Required fields
          </p>
          <div class="flex gap-3">
            <a 
              href="/trust-frameworks" 
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
                Create Framework
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
