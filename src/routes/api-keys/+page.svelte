<script lang="ts">
  import { onMount } from 'svelte';
  import { Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-svelte';
  import { apiKeyApi } from '$lib/api';
  import type { APIKey, CreateAPIKey } from '$lib/api/apiKeys';
  import { notifications } from '$lib/stores';
  import Modal from '$lib/components/common/Modal.svelte';

  let apiKeys = $state<APIKey[]>([]);
  let loading = $state(true);
  let showCreateModal = $state(false);
  let showKeyModal = $state(false);
  let newKeyValue = $state('');

  // Create form
  let newKeyName = $state('');
  let newKeyRole = $state<'admin' | 'registry_owner' | 'public'>('public');
  let newKeyExpiry = $state('');
  let creating = $state(false);

  onMount(async () => {
    await loadApiKeys();
  });

  async function loadApiKeys() {
    loading = true;
    try {
      const res = await apiKeyApi.list();
      apiKeys = res.data || [];
    } catch (error) {
      notifications.error('Failed to load API keys');
    } finally {
      loading = false;
    }
  }

  async function createApiKey() {
    if (!newKeyName) {
      notifications.error('Please enter a name');
      return;
    }

    creating = true;
    try {
      const data: CreateAPIKey = {
        name: newKeyName,
        role: newKeyRole,
        expiresAt: newKeyExpiry || undefined,
      };
      const res = await apiKeyApi.create(data);
      
      if (res.data?.key) {
        newKeyValue = res.data.key;
        showCreateModal = false;
        showKeyModal = true;
      }
      
      newKeyName = '';
      newKeyRole = 'public';
      newKeyExpiry = '';
      await loadApiKeys();
      notifications.success('API key created');
    } catch (error: any) {
      notifications.error(error.response?.data?.message || 'Failed to create API key');
    } finally {
      creating = false;
    }
  }

  async function deleteApiKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    
    try {
      await apiKeyApi.delete(id);
      notifications.success('API key deleted');
      await loadApiKeys();
    } catch (error) {
      notifications.error('Failed to delete API key');
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(newKeyValue);
    notifications.success('API key copied to clipboard');
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500';
      case 'registry_owner': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  }

  function isExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Key class="h-7 w-7" /></div>
        API Keys
      </h1>
      <p class="text-muted-foreground mt-1">Manage API keys for authentication</p>
    </div>
    <button onclick={() => showCreateModal = true} class="btn-default flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Create API Key
    </button>
  </div>

  <!-- Stats -->
  <div class="grid gap-4 md:grid-cols-3">
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Keys</p>
            <p class="text-2xl font-bold mt-1">{apiKeys.length}</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Key class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Admin Keys</p>
            <p class="text-2xl font-bold mt-1 text-red-500">{apiKeys.filter(k => k.role === 'admin').length}</p>
          </div>
          <div class="p-3 rounded-xl bg-red-500/10 text-red-500">
            <Shield class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active</p>
            <p class="text-2xl font-bold mt-1 text-emerald-500">{apiKeys.filter(k => !isExpired(k.expiresAt)).length}</p>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  {#if loading}
    <div class="card">
      <div class="card-content p-6">
        <div class="space-y-4">
          {#each Array(3) as _}
            <div class="h-16 animate-pulse rounded bg-muted"></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if apiKeys.length === 0}
    <div class="card">
      <div class="card-content p-12">
        <div class="text-center">
          <div class="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4">
            <Key class="h-12 w-12" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No API keys</h3>
          <p class="text-muted-foreground mb-6">Create your first API key to authenticate requests.</p>
          <button onclick={() => showCreateModal = true} class="btn-default inline-flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Create API Key
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Role</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Created</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Expires</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground">Last Used</th>
              <th class="px-6 py-4 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each apiKeys as apiKey}
              <tr class="group hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Key class="h-4 w-4" />
                    </div>
                    <span class="font-medium">{apiKey.name}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {getRoleColor(apiKey.role)}">
                    {apiKey.role}
                  </span>
                </td>
                <td class="px-6 py-4">
                  {#if isExpired(apiKey.expiresAt)}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                      <AlertCircle class="h-3 w-3" /> Expired
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 class="h-3 w-3" /> Active
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">
                  {apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleDateString() : 'Never'}
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">
                  {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : 'Never'}
                </td>
                <td class="px-6 py-4">
                  <button onclick={() => deleteApiKey(apiKey.id)} class="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- Create Modal -->
{#if showCreateModal}
  <Modal bind:open={showCreateModal} title="Create API Key" size="sm">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Name <span class="text-red-500">*</span></label>
        <input type="text" bind:value={newKeyName} placeholder="My API Key" class="input w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Role</label>
        <select bind:value={newKeyRole} class="input w-full">
          <option value="public">Public (Read-only)</option>
          <option value="registry_owner">Registry Owner</option>
          <option value="admin">Admin (Full access)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Expires At (optional)</label>
        <input type="datetime-local" bind:value={newKeyExpiry} class="input w-full" />
      </div>
    </div>

    {#snippet footer()}
      <button onclick={() => showCreateModal = false} class="btn-outline">Cancel</button>
      <button onclick={createApiKey} disabled={creating} class="btn-default flex items-center gap-2">
        {#if creating}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        {:else}
          <Plus class="h-4 w-4" />
        {/if}
        Create Key
      </button>
    {/snippet}
  </Modal>
{/if}

<!-- Key Display Modal -->
{#if showKeyModal}
  <Modal bind:open={showKeyModal} title="API Key Created" size="sm">
    <div class="space-y-4">
      <div class="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p class="font-medium text-amber-500">Save this key now!</p>
            <p class="text-sm text-muted-foreground mt-1">This is the only time you'll see this key. Store it securely.</p>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Your API Key</label>
        <div class="flex gap-2">
          <input type="text" value={newKeyValue} readonly class="input w-full font-mono text-sm" />
          <button onclick={copyKey} class="btn-outline flex items-center gap-2">
            <Copy class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    {#snippet footer()}
      <button onclick={() => { showKeyModal = false; newKeyValue = ''; }} class="btn-default">Done</button>
    {/snippet}
  </Modal>
{/if}
