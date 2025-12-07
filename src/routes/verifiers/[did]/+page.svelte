<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    ArrowLeft, UserCog, Shield, Clock, Globe, FileJson, Loader2, CheckCircle, AlertCircle, Database
  } from 'lucide-svelte';
  import { verifierApi } from '$lib/api';
  import type { Verifier } from '$lib/types';
  import { notifications } from '$lib/stores';
  import Modal from '$lib/components/common/Modal.svelte';

  let verifier = $state<Verifier | null>(null);
  let loading = $state(true);
  let showStatusModal = $state(false);
  let newStatus = $state<'pending' | 'active' | 'suspended' | 'revoked'>('active');
  let statusReason = $state('');
  let updating = $state(false);

  const did = $derived($page.params.did ?? '');

  onMount(async () => {
    if (did) await loadVerifier();
  });

  async function loadVerifier() {
    if (!did) return;
    loading = true;
    try {
      const response = await verifierApi.get(did);
      verifier = response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        notifications.error('Verifier not found');
        goto('/verifiers');
      } else {
        notifications.error('Failed to load verifier');
      }
    } finally {
      loading = false;
    }
  }

  async function handleStatusUpdate() {
    if (!verifier) return;
    updating = true;
    try {
      await verifierApi.updateStatus(verifier.did, newStatus, statusReason || undefined);
      notifications.success('Status updated successfully');
      showStatusModal = false;
      statusReason = '';
      await loadVerifier();
    } catch (error) {
      notifications.error('Failed to update status');
    } finally {
      updating = false;
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
      case 'pending': return 'text-blue-500 bg-blue-500/10';
      case 'suspended': return 'text-amber-500 bg-amber-500/10';
      case 'revoked': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  }
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex items-center justify-center min-h-[400px]">
      <Loader2 class="h-8 w-8 animate-spin text-amber-500" />
    </div>
  {:else if verifier}
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <a href="/verifiers" class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft class="h-5 w-5" />
          </a>
          <div class="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <UserCog class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{verifier.name || 'Unnamed Verifier'}</h1>
            <p class="text-muted-foreground mt-1 font-mono text-sm break-all">{verifier.did}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-14 sm:ml-0">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full {getStatusColor(verifier.status)}">
          {#if verifier.status === 'active'}
            <CheckCircle class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm font-medium capitalize">{verifier.status}</span>
        </div>
        <button onclick={() => { newStatus = verifier!.status; showStatusModal = true; }} class="btn-default flex items-center gap-2">
          <Shield class="h-4 w-4" />
          Change Status
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <UserCog class="h-5 w-5 text-amber-500" />
              Verifier Information
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">DID</label>
                <p class="font-mono text-sm break-all mt-1">{verifier.did}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Accreditation</label>
                <div class="mt-1">
                  {#if verifier.accreditationLevel}
                    <span class="capitalize text-sm">{verifier.accreditationLevel}</span>
                  {:else}
                    <span class="text-muted-foreground text-sm">Not specified</span>
                  {/if}
                </div>
              </div>
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Registry</label>
                <p class="mt-1">
                  {#if verifier.registry}
                    <a href="/registries/{verifier.registry.id}" class="text-blue-500 hover:text-blue-600 flex items-center gap-2">
                      <Database class="h-4 w-4" />
                      {verifier.registry.name}
                    </a>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Validity Period -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Clock class="h-5 w-5 text-amber-500" />
              Validity Period
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Valid From</label>
                <p class="mt-1">{formatDate(verifier.validFrom)}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Valid Until</label>
                <p class="mt-1 {verifier.validUntil && new Date(verifier.validUntil) < new Date() ? 'text-red-500' : ''}">
                  {formatDate(verifier.validUntil)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Credential Types -->
        {#if verifier.credentialSchemas && verifier.credentialSchemas.length > 0}
          <div class="card">
            <div class="card-header border-b">
              <h3 class="card-title flex items-center gap-2">
                <FileJson class="h-5 w-5 text-amber-500" />
                Credential Types
              </h3>
              <p class="card-description">{verifier.credentialSchemas.length} authorized credential types</p>
            </div>
            <div class="card-content p-6">
              <div class="space-y-2">
                {#each verifier.credentialSchemas as schema}
                  <a href="/schemas/{schema.id}" class="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                        <FileJson class="h-4 w-4" />
                      </div>
                      <div>
                        <p class="font-medium group-hover:text-cyan-500 transition-colors">{schema.name}</p>
                        <p class="text-xs text-muted-foreground">{schema.type} v{schema.version}</p>
                      </div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.verifierMode}</span>
                  </a>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Globe class="h-5 w-5 text-amber-500" />
              Jurisdictions
            </h3>
          </div>
          <div class="card-content p-6">
            {#if verifier.jurisdictions && verifier.jurisdictions.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each verifier.jurisdictions as j}
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium">
                    <Globe class="h-3 w-3 text-muted-foreground" />
                    {j.code}{j.name ? ` - ${j.name}` : ''}
                  </span>
                {/each}
              </div>
            {:else}
              <p class="text-muted-foreground text-sm">No jurisdictions specified</p>
            {/if}
          </div>
        </div>

        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Metadata</h3>
          </div>
          <div class="card-content p-6 space-y-4">
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Created</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(verifier.createdAt)}
              </p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(verifier.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Modal -->
    {#if showStatusModal}
      <Modal bind:open={showStatusModal} title="Change Verifier Status" size="sm">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">New Status</label>
            <select bind:value={newStatus} class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Reason (optional)</label>
            <textarea bind:value={statusReason} rows="3" class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none" placeholder="Reason for status change..."></textarea>
          </div>
        </div>

        {#snippet footer()}
          <button onclick={() => showStatusModal = false} class="btn-outline">
            Cancel
          </button>
          <button onclick={handleStatusUpdate} disabled={updating} class="btn-default flex items-center gap-2 min-w-[140px] justify-center">
            {#if updating}
              <Loader2 class="w-4 h-4 animate-spin" />
              Updating...
            {:else}
              <CheckCircle class="w-4 h-4" />
              Update Status
            {/if}
          </button>
        {/snippet}
      </Modal>
    {/if}
  {/if}
</div>
