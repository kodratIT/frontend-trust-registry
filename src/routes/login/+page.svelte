<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Key, Loader2, Sparkles, Shield, ArrowRight, AlertCircle } from 'lucide-svelte';
  import { auth, notifications, isAuthenticated } from '$lib/stores';
  import { apiKeyApi } from '$lib/api';
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';

  let apiKey = $state('');
  let loading = $state(false);
  let errorMessage = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      notifications.warning('Please enter an API key');
      return;
    }

    loading = true;
    errorMessage = '';

    try {
      console.log('[Login] Validating API key with backend...');
      
      // Validate API key with backend
      const validation = await apiKeyApi.validate(apiKey.trim());
      
      if (!validation.valid) {
        console.error('[Login] Invalid API key:', validation.reason);
        errorMessage = validation.reason || 'Invalid API key';
        notifications.error(errorMessage);
        loading = false;
        return;
      }

      console.log('[Login] API key validated successfully');
      
      // Determine role from validation
      const role = validation.apiKey?.role || 'public';
      
      // Login and wait for state to update
      await auth.login(apiKey.trim(), role);
      console.log('[Login] Login successful, role:', role);
      
      notifications.success(`Welcome to Trust Registry (${role})`);
      
      // Redirect after login completes
      console.log('[Login] Redirecting to /');
      window.location.href = '/';
    } catch (error) {
      console.error('[Login] Error:', error);
      errorMessage = 'Unable to connect to backend. Please check if the server is running.';
      notifications.error(errorMessage);
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex">
  <!-- Left Panel - Branding -->
  <div class="hidden lg:flex lg:w-1/2 bg-muted relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"></div>
    <div class="relative z-10 flex flex-col justify-between p-12">
      <div class="flex items-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles class="h-5 w-5" />
        </div>
        <span class="text-xl font-bold">Trust Registry</span>
      </div>
      
      <div class="space-y-6">
        <blockquote class="space-y-2">
          <p class="text-lg">
            "The ToIP Trust Registry Protocol enables verifiable trust decisions across decentralized identity ecosystems."
          </p>
          <footer class="text-sm text-muted-foreground">
            — Trust over IP Foundation
          </footer>
        </blockquote>
      </div>

      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <Shield class="h-4 w-4" />
          <span>ToIP Protocol v2</span>
        </div>
        <span>•</span>
        <span>Secure by Design</span>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
    <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
  </div>

  <!-- Right Panel - Login Form -->
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Mobile Logo -->
      <div class="lg:hidden flex items-center justify-center gap-2 mb-8">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles class="h-5 w-5" />
        </div>
        <span class="text-xl font-bold">Trust Registry</span>
      </div>

      <div class="space-y-2 text-center lg:text-left">
        <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p class="text-muted-foreground">Enter your API key to access the dashboard</p>
      </div>

      <Card>
        <CardContent class="pt-6">
          {#snippet children()}
            <form onsubmit={handleSubmit} class="space-y-4">
              {#if errorMessage}
                <div class="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle class="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div class="flex-1">
                    <p class="text-sm font-medium">Authentication Failed</p>
                    <p class="text-xs mt-1">{errorMessage}</p>
                  </div>
                </div>
              {/if}

              <div class="space-y-2">
                <label for="apiKey" class="text-sm font-medium leading-none">
                  API Key
                </label>
                <div class="relative">
                  <Key class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="apiKey"
                    type="password"
                    bind:value={apiKey}
                    placeholder="Enter your API key"
                    class="pl-9"
                    disabled={loading}
                  />
                </div>
                <p class="text-xs text-muted-foreground">
                  Your API key will be validated with the backend server
                </p>
              </div>

              <Button type="submit" disabled={loading} class="w-full">
                {#snippet children()}
                  {#if loading}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  {:else}
                    Sign In
                    <ArrowRight class="ml-2 h-4 w-4" />
                  {/if}
                {/snippet}
              </Button>
            </form>
          {/snippet}
        </CardContent>
      </Card>

      <div class="text-center text-sm text-muted-foreground">
        <p>
          Don't have an API key?{' '}
          <button type="button" class="text-primary hover:underline" onclick={() => notifications.info('Please contact your system administrator for an API key')}>
            Contact administrator
          </button>
        </p>
      </div>

      <!-- Demo credentials hint -->
      <div class="rounded-lg border bg-muted/50 p-4">
        <p class="text-sm font-medium mb-2">Demo Access</p>
        <p class="text-xs text-muted-foreground">
          For demo purposes, enter any API key to access the dashboard.
        </p>
      </div>
    </div>
  </div>
</div>
