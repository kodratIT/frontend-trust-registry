<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Shield, Database, UserCheck, UserCog, FileJson, 
    TrendingUp, ArrowRight, Activity, Clock,
    Plus, Sparkles, CheckCircle2, AlertCircle, RefreshCw,
    ArrowUpRight, Users, FileCheck, XCircle
  } from 'lucide-svelte';
  import { trustFrameworkApi, registryApi, issuerApi, verifierApi, schemaApi, auditApi } from '$lib/api';
  import type { Issuer, Verifier, AuditLog, TrustFramework, TrustRegistry } from '$lib/types';

  // Stats
  let stats = $state({
    frameworks: { count: 0, active: 0, change: 0 },
    registries: { count: 0, active: 0, change: 0 },
    issuers: { count: 0, active: 0, change: 0 },
    verifiers: { count: 0, active: 0, change: 0 },
    schemas: { count: 0, change: 0 },
  });

  // Recent data
  let recentIssuers = $state<Issuer[]>([]);
  let recentVerifiers = $state<Verifier[]>([]);
  let recentAuditLogs = $state<AuditLog[]>([]);
  let topFrameworks = $state<TrustFramework[]>([]);
  let topRegistries = $state<TrustRegistry[]>([]);
  
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData() {
    loading = true;
    error = null;
    
    try {
      const [
        frameworksRes,
        registriesRes,
        issuersRes,
        verifiersRes,
        schemasRes,
        recentIssuersRes,
        recentVerifiersRes,
        auditLogsRes
      ] = await Promise.all([
        trustFrameworkApi.list({ limit: 100 }),
        registryApi.list({ limit: 100 }),
        issuerApi.list({ limit: 100 }),
        verifierApi.list({ limit: 100 }),
        schemaApi.list({ limit: 100 }),
        issuerApi.list({ limit: 6 }),
        verifierApi.list({ limit: 6 }),
        auditApi.list({ limit: 10 }),
      ]);

      // Calculate active counts
      const activeFrameworks = frameworksRes.data.filter((f: any) => f.status === 'active').length;
      const activeRegistries = registriesRes.data.filter((r: any) => r.status === 'active').length;
      const activeIssuers = issuersRes.data.filter((i: any) => i.status === 'active').length;
      const activeVerifiers = verifiersRes.data.filter((v: any) => v.status === 'active').length;

      stats = {
        frameworks: { 
          count: frameworksRes.meta.total, 
          active: activeFrameworks,
          change: 12 // Mock data
        },
        registries: { 
          count: registriesRes.meta.total, 
          active: activeRegistries,
          change: 8
        },
        issuers: { 
          count: issuersRes.meta.total, 
          active: activeIssuers,
          change: 15
        },
        verifiers: { 
          count: verifiersRes.meta.total, 
          active: activeVerifiers,
          change: 10
        },
        schemas: { 
          count: schemasRes.meta.total,
          change: 5
        },
      };

      recentIssuers = recentIssuersRes.data;
      recentVerifiers = recentVerifiersRes.data;
      recentAuditLogs = auditLogsRes.data;
      topFrameworks = frameworksRes.data.slice(0, 3);
      topRegistries = registriesRes.data.slice(0, 3);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      error = 'Failed to load dashboard data. Please check if the backend is running.';
    } finally {
      loading = false;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'suspended': return 'bg-orange-500';
      case 'revoked': return 'bg-red-500';
      default: return 'bg-muted';
    }
  }

  function getActionIcon(action: string) {
    switch (action) {
      case 'create': return Plus;
      case 'update': return RefreshCw;
      case 'delete': return XCircle;
      default: return Activity;
    }
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  function getInitials(name: string | undefined, did: string): string {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    const parts = did.split(':');
    return parts[parts.length - 1].slice(0, 2).toUpperCase();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Sparkles class="h-8 w-8 text-primary" />
        Dashboard
      </h1>
      <p class="text-muted-foreground mt-1">Trust Registry ecosystem overview and analytics</p>
    </div>
    <div class="flex items-center gap-2">
      <button 
        onclick={loadDashboardData} 
        class="btn-outline flex items-center gap-2"
        disabled={loading}
      >
        <RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
        Refresh
      </button>
      <a href="/issuers/new" class="btn-default flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Register Entity
      </a>
    </div>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="h-5 w-5 text-destructive mt-0.5" />
        <div class="flex-1">
          <p class="font-medium text-destructive">Error Loading Dashboard</p>
          <p class="text-sm text-destructive/80 mt-1">{error}</p>
          <button onclick={loadDashboardData} class="text-sm underline mt-2">Try again</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Stats Grid -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
    <!-- Trust Frameworks -->
    <div class="card group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="card-content p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-xl bg-violet-500/10 text-violet-500 group-hover:bg-violet-500/20 transition-colors">
            <Shield class="h-6 w-6" />
          </div>
          <span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp class="h-3 w-3" />
            +{stats.frameworks.change}%
          </span>
        </div>
        {#if loading}
          <div class="space-y-2">
            <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        {:else}
          <div>
            <div class="text-3xl font-bold">{stats.frameworks.count}</div>
            <p class="text-sm text-muted-foreground mt-1">Trust Frameworks</p>
            <p class="text-xs text-emerald-500 mt-2">{stats.frameworks.active} active</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Registries -->
    <div class="card group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="card-content p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            <Database class="h-6 w-6" />
          </div>
          <span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp class="h-3 w-3" />
            +{stats.registries.change}%
          </span>
        </div>
        {#if loading}
          <div class="space-y-2">
            <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        {:else}
          <div>
            <div class="text-3xl font-bold">{stats.registries.count}</div>
            <p class="text-sm text-muted-foreground mt-1">Registries</p>
            <p class="text-xs text-emerald-500 mt-2">{stats.registries.active} active</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Issuers -->
    <div class="card group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="card-content p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
            <UserCheck class="h-6 w-6" />
          </div>
          <span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp class="h-3 w-3" />
            +{stats.issuers.change}%
          </span>
        </div>
        {#if loading}
          <div class="space-y-2">
            <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        {:else}
          <div>
            <div class="text-3xl font-bold">{stats.issuers.count}</div>
            <p class="text-sm text-muted-foreground mt-1">Issuers</p>
            <p class="text-xs text-emerald-500 mt-2">{stats.issuers.active} active</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Verifiers -->
    <div class="card group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="card-content p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
            <UserCog class="h-6 w-6" />
          </div>
          <span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp class="h-3 w-3" />
            +{stats.verifiers.change}%
          </span>
        </div>
        {#if loading}
          <div class="space-y-2">
            <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        {:else}
          <div>
            <div class="text-3xl font-bold">{stats.verifiers.count}</div>
            <p class="text-sm text-muted-foreground mt-1">Verifiers</p>
            <p class="text-xs text-emerald-500 mt-2">{stats.verifiers.active} active</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Schemas -->
    <div class="card group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="card-content p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20 transition-colors">
            <FileJson class="h-6 w-6" />
          </div>
          <span class="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <TrendingUp class="h-3 w-3" />
            +{stats.schemas.change}%
          </span>
        </div>
        {#if loading}
          <div class="space-y-2">
            <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        {:else}
          <div>
            <div class="text-3xl font-bold">{stats.schemas.count}</div>
            <p class="text-sm text-muted-foreground mt-1">Schemas</p>
            <p class="text-xs text-muted-foreground mt-2">Credential types</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Recent Registrations - Takes 2 columns -->
    <div class="card lg:col-span-2">
      <div class="card-header border-b">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="card-title flex items-center gap-2">
              <Users class="h-5 w-5 text-primary" />
              Recent Registrations
            </h3>
            <p class="card-description">Latest issuers and verifiers in the ecosystem</p>
          </div>
          <a href="/issuers" class="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight class="h-3 w-3" />
          </a>
        </div>
      </div>
      <div class="card-content p-6">
        {#if loading}
          <div class="space-y-4">
            {#each Array(4) as _}
              <div class="flex items-center gap-4">
                <div class="h-12 w-12 animate-pulse rounded-full bg-muted"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  <div class="h-3 w-48 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if recentIssuers.length === 0 && recentVerifiers.length === 0}
          <div class="text-center py-12">
            <UserCheck class="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p class="text-muted-foreground">No registrations yet</p>
            <a href="/issuers/new" class="text-primary hover:underline text-sm mt-2 inline-block">
              Register your first entity →
            </a>
          </div>
        {:else}
          <div class="space-y-3">
            {#each [...recentIssuers.slice(0, 3), ...recentVerifiers.slice(0, 3)].slice(0, 6) as entity}
              {@const isIssuer = 'credentialTypes' in entity}
              <a 
                href={isIssuer ? `/issuers/${encodeURIComponent(entity.did)}` : `/verifiers/${encodeURIComponent(entity.did)}`}
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-full {isIssuer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} text-sm font-medium group-hover:scale-110 transition-transform">
                  {getInitials(entity.name, entity.did)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{entity.name || 'Unnamed Entity'}</p>
                  <p class="text-xs text-muted-foreground font-mono truncate">{entity.did}</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full {getStatusColor(entity.status)}"></span>
                    <span class="text-xs text-muted-foreground capitalize">{entity.status}</span>
                  </div>
                  <span class="badge-secondary text-xs">{isIssuer ? 'Issuer' : 'Verifier'}</span>
                  <ArrowUpRight class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Activity Log -->
    <div class="card">
      <div class="card-header border-b">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="card-title flex items-center gap-2">
              <Activity class="h-5 w-5 text-primary" />
              Activity Log
            </h3>
            <p class="card-description">Recent system events</p>
          </div>
          <a href="/audit" class="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight class="h-3 w-3" />
          </a>
        </div>
      </div>
      <div class="card-content p-6">
        {#if loading}
          <div class="space-y-4">
            {#each Array(5) as _}
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 animate-pulse rounded bg-muted"></div>
                <div class="flex-1 space-y-1">
                  <div class="h-3 w-24 animate-pulse rounded bg-muted"></div>
                  <div class="h-3 w-32 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if recentAuditLogs.length === 0}
          <div class="text-center py-12">
            <Activity class="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p class="text-muted-foreground text-sm">No activity yet</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each recentAuditLogs as log}
              {@const ActionIcon = getActionIcon(log.action)}
              <div class="flex items-start gap-3 text-sm group">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <ActionIcon class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate">
                    <span class="font-medium capitalize">{log.action}</span>
                    <span class="text-muted-foreground"> {log.resourceType}</span>
                  </p>
                  <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock class="h-3 w-3" />
                    <span>{formatTime(log.timestamp)}</span>
                    {#if log.result === 'success'}
                      <CheckCircle2 class="h-3 w-3 text-emerald-500" />
                    {:else}
                      <AlertCircle class="h-3 w-3 text-red-500" />
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <a href="/trust-frameworks/new" class="card group hover:shadow-lg hover:border-primary/50 transition-all">
      <div class="card-content p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-violet-500/10 text-violet-500 group-hover:bg-violet-500/20 transition-colors">
            <Shield class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <p class="font-medium">Create Framework</p>
            <p class="text-xs text-muted-foreground">New trust framework</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>

    <a href="/registries/new" class="card group hover:shadow-lg hover:border-primary/50 transition-all">
      <div class="card-content p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            <Database class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <p class="font-medium">Create Registry</p>
            <p class="text-xs text-muted-foreground">New trust registry</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>

    <a href="/schemas/new" class="card group hover:shadow-lg hover:border-primary/50 transition-all">
      <div class="card-content p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20 transition-colors">
            <FileCheck class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <p class="font-medium">Create Schema</p>
            <p class="text-xs text-muted-foreground">Credential schema</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>

    <a href="/query" class="card group hover:shadow-lg hover:border-primary/50 transition-all">
      <div class="card-content p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
            <Activity class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <p class="font-medium">Test Query</p>
            <p class="text-xs text-muted-foreground">Query interface</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>
  </div>
</div>
