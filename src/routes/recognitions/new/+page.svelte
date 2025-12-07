<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowLeft, Link2, Save } from 'lucide-svelte';
  import { recognitionApi, registryApi } from '$lib/api';
  import type { TrustRegistry } from '$lib/types';
  import { notifications } from '$lib/stores';
  import { onMount } from 'svelte';

  let registries = $state<TrustRegistry[]>([]);
  let loading = $state(false);
  let loadingRegistries = $state(true);

  // Form
  let authorityRegistryId = $state('');
  let entityId = $state('');
  let action = $state('govern');
  let resource = $state('');
  let validFrom = $state('');
  let validUntil = $state('');

  const actions = ['govern', 'recognize', 'delegate'];

  onMount(async () => {
    try {
      const res = await registryApi.list({ limit: 100 });
      registries = res.data;
    } catch (e) {
      notifications.error('Failed to load registries');
    } finally {
      loadingRegistries = false;
    }
  });

  async function handleSubmit() {
    if (!authorityRegistryId || !entityId || !action || !resource) {
      notifications.error('Please fill all required fields');
      return;
    }

    loading = true;
    try {
      await recognitionApi.create({
        authorityRegistryId,
        entityId,
        action,
        resource,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
      });
      notifications.success('Recognition created successfully');
      goto('/recognitions');
    } catch (error: any) {
      notifications.error(error.response?.data?.message || 'Failed to create recognition');
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/recognitions" class="p-2 rounded-lg hover:bg-muted transition-colors">
      <ArrowLeft class="h-5 w-5" />
    </a>
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Link2 class="h-7 w-7" /></div>
        Create Recognition
      </h1>
      <p class="text-muted-foreground mt-1">Create a new inter-registry trust relationship</p>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="card">
        <div class="card-header border-b">
          <h3 class="card-title">Recognition Details</h3>
          <p class="card-description">Define the trust relationship between registries</p>
        </div>
        <div class="card-content p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">
              Authority Registry <span class="text-destructive">*</span>
            </label>
            {#if loadingRegistries}
              <div class="h-10 animate-pulse rounded bg-muted"></div>
            {:else}
              <select bind:value={authorityRegistryId} class="input w-full" required>
                <option value="">Select registry...</option>
                {#each registries as reg}
                  <option value={reg.id}>{reg.name} ({reg.ecosystemDid})</option>
                {/each}
              </select>
            {/if}
            <p class="text-xs text-muted-foreground mt-1">The registry making the recognition</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Entity ID (DID) <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              bind:value={entityId}
              placeholder="did:web:other-registry.org"
              class="input w-full"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">The DID of the entity being recognized (usually another registry)</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                Action <span class="text-destructive">*</span>
              </label>
              <select bind:value={action} class="input w-full" required>
                {#each actions as act}
                  <option value={act}>{act}</option>
                {/each}
              </select>
              <p class="text-xs text-muted-foreground mt-1">Type of recognition</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">
                Resource <span class="text-destructive">*</span>
              </label>
              <input
                type="text"
                bind:value={resource}
                placeholder="professional-licenses"
                class="input w-full"
                required
              />
              <p class="text-xs text-muted-foreground mt-1">Scope of recognition</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Valid From</label>
              <input type="datetime-local" bind:value={validFrom} class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Valid Until</label>
              <input type="datetime-local" bind:value={validUntil} class="input w-full" />
            </div>
          </div>
        </div>
        <div class="card-footer border-t p-6">
          <div class="flex justify-end gap-3">
            <a href="/recognitions" class="btn-outline">Cancel</a>
            <button type="submit" disabled={loading} class="btn-default flex items-center gap-2">
              {#if loading}
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {:else}
                <Save class="h-4 w-4" />
              {/if}
              Create Recognition
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="space-y-4">
      <div class="card">
        <div class="card-content p-6">
          <h4 class="font-semibold mb-3">About Recognition</h4>
          <p class="text-sm text-muted-foreground">
            Recognition creates a trust relationship where one authority (registry) formally recognizes another entity as authoritative for specific actions and resources.
          </p>
        </div>
      </div>
      <div class="card">
        <div class="card-content p-6">
          <h4 class="font-semibold mb-3">Action Types</h4>
          <ul class="text-sm text-muted-foreground space-y-2">
            <li><strong>govern</strong> - Recognize governance authority</li>
            <li><strong>recognize</strong> - General recognition</li>
            <li><strong>delegate</strong> - Delegated authority</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
