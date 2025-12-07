<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    ArrowLeft, UserCheck, Shield, Clock, Globe, 
    FileJson, AlertCircle, CheckCircle, Loader2, ExternalLink, Database, Building,
    Users, Plus, Trash2, Link
  } from 'lucide-svelte';
  import { issuerApi, delegationApi } from '$lib/api';
  import type { Issuer } from '$lib/types';
  import type { Delegation } from '$lib/api';
  import { notifications } from '$lib/stores';
  import Modal from '$lib/components/common/Modal.svelte';

  let issuer = $state<Issuer | null>(null);
  let delegations = $state<Delegation[]>([]);
  let loading = $state(true);
  let loadingDelegations = $state(false);
  let showStatusModal = $state(false);
  let showDelegationModal = $state(false);
  let showDeleteConfirm = $state(false);
  let newStatus = $state<'pending' | 'active' | 'suspended' | 'revoked'>('active');
  let statusReason = $state('');
  let updating = $state(false);
  
  // Delegation form
  let delegateDid = $state('');
  let delegationValidUntil = $state('');
  let creatingDelegation = $state(false);

  const did = $derived($page.params.did ?? '');

  onMount(async () => {
    if (did) {
      await loadIssuer();
      await loadDelegations();
    }
  });

  async function loadDelegations() {
    if (!did) return;
    loadingDelegations = true;
    try {
      const res = await delegationApi.listDelegates(did);
      delegations = res.data || [];
    } catch (error) {
      console.error('Failed to load delegations');
    } finally {
      loadingDelegations = false;
    }
  }

  async function createDelegation() {
    if (!delegateDid) {
      notifications.error('Please enter delegate DID');
      return;
    }
    creatingDelegation = true;
    try {
      await delegationApi.create(did, {
        delegateDid,
        scope: {},
        delegationProof: { type: 'placeholder' },
        validUntil: delegationValidUntil || undefined,
      });
      notifications.success('Delegation created');
      showDelegationModal = false;
      delegateDid = '';
      delegationValidUntil = '';
      await loadDelegations();
    } catch (error: any) {
      notifications.error(error.response?.data?.message || 'Failed to create delegation');
    } finally {
      creatingDelegation = false;
    }
  }

  async function revokeDelegation(delegateDidToRevoke: string) {
    if (!confirm('Are you sure you want to revoke this delegation?')) return;
    try {
      await delegationApi.revoke(did, delegateDidToRevoke);
      notifications.success('Delegation revoked');
      await loadDelegations();
    } catch (error) {
      notifications.error('Failed to revoke delegation');
    }
  }

  async function loadIssuer() {
    if (!did) return;
    loading = true;
    try {
      const response = await issuerApi.get(did);
      issuer = response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        notifications.error('Issuer not found');
        goto('/issuers');
      } else {
        notifications.error('Failed to load issuer');
      }
    } finally {
      loading = false;
    }
  }

  async function handleStatusUpdate() {
    if (!issuer) return;
    updating = true;
    try {
      await issuerApi.updateStatus(issuer.did, newStatus, statusReason || undefined);
      notifications.success('Status updated successfully');
      showStatusModal = false;
      statusReason = '';
      await loadIssuer();
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
      <Loader2 class="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  {:else if issuer}
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <a href="/issuers" class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft class="h-5 w-5" />
          </a>
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{issuer.name || 'Unnamed Issuer'}</h1>
            <p class="text-muted-foreground mt-1 font-mono text-sm break-all">{issuer.did}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-14 sm:ml-0">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full {getStatusColor(issuer.status)}">
          {#if issuer.status === 'active'}
            <CheckCircle class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm font-medium capitalize">{issuer.status}</span>
        </div>
        <button onclick={() => { newStatus = issuer!.status; showStatusModal = true; }} class="btn-default flex items-center gap-2">
          <Shield class="h-4 w-4" />
          Change Status
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <UserCheck class="h-5 w-5 text-emerald-500" />
              Issuer Information
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">DID</label>
                <p class="font-mono text-sm break-all mt-1">{issuer.did}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Accreditation</label>
                <div class="mt-1">
                  {#if issuer.accreditationLevel}
                    <span class="capitalize text-sm">{issuer.accreditationLevel}</span>
                  {:else}
                    <span class="text-muted-foreground text-sm">Not specified</span>
                  {/if}
                </div>
              </div>
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Registry</label>
                <p class="mt-1">
                  {#if issuer.registry}
                    <a href="/registries/{issuer.registry.id}" class="text-blue-500 hover:text-blue-600 flex items-center gap-2">
                      <Database class="h-4 w-4" />
                      {issuer.registry.name}
                    </a>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </p>
              </div>
              {#if issuer.endpoint}
                <div class="col-span-2">
                  <label class="text-xs text-muted-foreground uppercase tracking-wide">Endpoint</label>
                  <a href={issuer.endpoint} target="_blank" class="flex items-center gap-2 text-blue-500 hover:text-blue-600 mt-1 break-all">
                    {issuer.endpoint}
                    <ExternalLink class="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Validity Period -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Clock class="h-5 w-5 text-emerald-500" />
              Validity Period
            </h3>
          </div>
          <div class="card-content p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Valid From</label>
                <p class="mt-1">{formatDate(issuer.validFrom)}</p>
              </div>
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wide">Valid Until</label>
                <p class="mt-1 {issuer.validUntil && new Date(issuer.validUntil) < new Date() ? 'text-red-500' : ''}">
                  {formatDate(issuer.validUntil)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Credential Types -->
        {#if issuer.credentialSchemas && issuer.credentialSchemas.length > 0}
          <div class="card">
            <div class="card-header border-b">
              <h3 class="card-title flex items-center gap-2">
                <FileJson class="h-5 w-5 text-emerald-500" />
                Credential Types
              </h3>
              <p class="card-description">{issuer.credentialSchemas.length} authorized credential types</p>
            </div>
            <div class="card-content p-6">
              <div class="space-y-2">
                {#each issuer.credentialSchemas as schema}
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
                    <span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{schema.issuerMode}</span>
                  </a>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Delegations -->
        <div class="card">
          <div class="card-header border-b">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="card-title flex items-center gap-2">
                  <Users class="h-5 w-5 text-emerald-500" />
                  Delegations
                </h3>
                <p class="card-description">Issuers delegated by this issuer</p>
              </div>
              <button onclick={() => showDelegationModal = true} class="btn-outline text-sm flex items-center gap-1">
                <Plus class="h-4 w-4" />
                Add Delegate
              </button>
            </div>
          </div>
          <div class="card-content p-6">
            {#if loadingDelegations}
              <div class="space-y-2">
                {#each Array(2) as _}
                  <div class="h-16 animate-pulse rounded bg-muted"></div>
                {/each}
              </div>
            {:else if delegations.length === 0}
              <div class="text-center py-8">
                <Users class="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p class="text-muted-foreground text-sm">No delegations yet</p>
                <button onclick={() => showDelegationModal = true} class="text-emerald-500 hover:underline text-sm mt-2">
                  Create first delegation →
                </button>
              </div>
            {:else}
              <div class="space-y-2">
                {#each delegations as delegation}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50 group">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                        <Link class="h-4 w-4" />
                      </div>
                      <div>
                        <p class="font-medium text-sm">{delegation.delegateIssuer?.name || 'Unnamed'}</p>
                        <p class="text-xs text-muted-foreground font-mono">{delegation.delegateIssuerDid}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded-full {delegation.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}">{delegation.status}</span>
                      <button onclick={() => revokeDelegation(delegation.delegateIssuerDid)} class="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Jurisdictions -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2">
              <Globe class="h-5 w-5 text-emerald-500" />
              Jurisdictions
            </h3>
          </div>
          <div class="card-content p-6">
            {#if issuer.jurisdictions && issuer.jurisdictions.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each issuer.jurisdictions as j}
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

        <!-- Timestamps -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Metadata</h3>
          </div>
          <div class="card-content p-6 space-y-4">
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Created</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(issuer.createdAt)}
              </p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</label>
              <p class="mt-1 text-sm flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                {formatDate(issuer.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delegation Modal -->
    {#if showDelegationModal}
      <Modal bind:open={showDelegationModal} title="Create Delegation" size="sm">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Delegate DID <span class="text-red-500">*</span></label>
            <input type="text" bind:value={delegateDid} placeholder="did:web:delegate.example.com" class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
            <p class="text-xs text-muted-foreground mt-1">The DID of the issuer to delegate to</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Valid Until (optional)</label>
            <input type="datetime-local" bind:value={delegationValidUntil} class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
          </div>
        </div>

        {#snippet footer()}
          <button onclick={() => showDelegationModal = false} class="btn-outline">Cancel</button>
          <button onclick={createDelegation} disabled={creatingDelegation} class="btn-default flex items-center gap-2">
            {#if creatingDelegation}
              <Loader2 class="w-4 h-4 animate-spin" />
            {:else}
              <Plus class="w-4 h-4" />
            {/if}
            Create Delegation
          </button>
        {/snippet}
      </Modal>
    {/if}

    <!-- Status Modal -->
    {#if showStatusModal}
      <Modal bind:open={showStatusModal} title="Change Issuer Status" size="sm">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">New Status</label>
            <select bind:value={newStatus} class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Reason (optional)</label>
            <textarea bind:value={statusReason} rows="3" class="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none" placeholder="Reason for status change..."></textarea>
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
