<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ArrowLeft, Link2, Trash2, CheckCircle2, XCircle, Calendar, Clock } from 'lucide-svelte';
  import { recognitionApi } from '$lib/api';
  import type { Recognition } from '$lib/api';
  import { notifications } from '$lib/stores';

  let recognition = $state<Recognition | null>(null);
  let loading = $state(true);
  let deleting = $state(false);

  const id = $derived($page.params.id ?? '');

  onMount(async () => {
    if (id) await loadRecognition();
  });

  async function loadRecognition() {
    if (!id) return;
    loading = true;
    try {
      const res = await recognitionApi.get(id);
      recognition = res.data;
    } catch (error) {
      notifications.error('Failed to load recognition');
      goto('/recognitions');
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Are you sure you want to revoke this recognition?')) return;
    
    deleting = true;
    try {
      await recognitionApi.delete(id);
      notifications.success('Recognition revoked');
      goto('/recognitions');
    } catch (error) {
      notifications.error('Failed to revoke recognition');
    } finally {
      deleting = false;
    }
  }

  function isValid(rec: Recognition): boolean {
    const now = new Date();
    if (rec.validFrom && new Date(rec.validFrom) > now) return false;
    if (rec.validUntil && new Date(rec.validUntil) < now) return false;
    return rec.recognized;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/recognitions" class="p-2 rounded-lg hover:bg-muted transition-colors">
        <ArrowLeft class="h-5 w-5" />
      </a>
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
          <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Link2 class="h-7 w-7" /></div>
          Recognition Details
        </h1>
        <p class="text-muted-foreground mt-1">View recognition relationship details</p>
      </div>
    </div>
    {#if recognition}
      <button onclick={handleDelete} disabled={deleting} class="btn-outline text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2">
        {#if deleting}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        {:else}
          <Trash2 class="h-4 w-4" />
        {/if}
        Revoke
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="card">
      <div class="card-content p-6">
        <div class="space-y-4">
          {#each Array(6) as _}
            <div class="h-8 animate-pulse rounded bg-muted"></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if recognition}
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-6">
        <!-- Status Card -->
        <div class="card">
          <div class="card-content p-6">
            <div class="flex items-center gap-4 p-4 rounded-lg {isValid(recognition) ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}">
              {#if isValid(recognition)}
                <CheckCircle2 class="h-10 w-10 text-emerald-500" />
                <div>
                  <p class="text-lg font-semibold text-emerald-500">Active Recognition</p>
                  <p class="text-sm text-muted-foreground">This recognition is currently valid</p>
                </div>
              {:else}
                <XCircle class="h-10 w-10 text-amber-500" />
                <div>
                  <p class="text-lg font-semibold text-amber-500">Invalid Recognition</p>
                  <p class="text-sm text-muted-foreground">This recognition is expired or not yet valid</p>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title">Recognition Details</h3>
          </div>
          <div class="card-content p-6">
            <dl class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between py-3 border-b">
                <dt class="text-sm text-muted-foreground">Authority Registry</dt>
                <dd class="font-medium mt-1 sm:mt-0">
                  {#if recognition.authority}
                    <div class="text-right">
                      <p>{recognition.authority.name}</p>
                      <p class="text-xs text-muted-foreground font-mono">{recognition.authority.ecosystemDid}</p>
                    </div>
                  {:else}
                    <span class="text-muted-foreground">Unknown</span>
                  {/if}
                </dd>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between py-3 border-b">
                <dt class="text-sm text-muted-foreground">Entity ID</dt>
                <dd class="font-mono text-sm mt-1 sm:mt-0">{recognition.entityId}</dd>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between py-3 border-b">
                <dt class="text-sm text-muted-foreground">Action</dt>
                <dd class="mt-1 sm:mt-0"><span class="badge-secondary">{recognition.action}</span></dd>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between py-3 border-b">
                <dt class="text-sm text-muted-foreground">Resource</dt>
                <dd class="mt-1 sm:mt-0"><span class="badge-secondary">{recognition.resource}</span></dd>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between py-3 border-b">
                <dt class="text-sm text-muted-foreground">Recognized</dt>
                <dd class="mt-1 sm:mt-0">
                  {#if recognition.recognized}
                    <span class="text-emerald-500 flex items-center gap-1"><CheckCircle2 class="h-4 w-4" /> Yes</span>
                  {:else}
                    <span class="text-red-500 flex items-center gap-1"><XCircle class="h-4 w-4" /> No</span>
                  {/if}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Validity Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2"><Calendar class="h-4 w-4" /> Validity Period</h3>
          </div>
          <div class="card-content p-6 space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">Valid From</p>
              <p class="font-medium">
                {recognition.validFrom ? new Date(recognition.validFrom).toLocaleString() : 'No start date'}
              </p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Valid Until</p>
              <p class="font-medium">
                {recognition.validUntil ? new Date(recognition.validUntil).toLocaleString() : 'No expiry'}
              </p>
            </div>
          </div>
        </div>

        <!-- Timestamps Card -->
        <div class="card">
          <div class="card-header border-b">
            <h3 class="card-title flex items-center gap-2"><Clock class="h-4 w-4" /> Timestamps</h3>
          </div>
          <div class="card-content p-6 space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">Created</p>
              <p class="font-medium">{new Date(recognition.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Updated</p>
              <p class="font-medium">{new Date(recognition.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <!-- Metadata Card -->
        {#if recognition.metadata && Object.keys(recognition.metadata).length > 0}
          <div class="card">
            <div class="card-header border-b">
              <h3 class="card-title">Metadata</h3>
            </div>
            <div class="card-content p-6">
              <pre class="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify(recognition.metadata, null, 2)}</pre>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
