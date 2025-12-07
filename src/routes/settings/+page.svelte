<script lang="ts">
  import { Settings, Key, User, Bell, Shield, Save, Eye, EyeOff, Check } from 'lucide-svelte';
  import { auth, notifications } from '$lib/stores';
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Switch from '$lib/components/ui/switch.svelte';
  import Separator from '$lib/components/ui/separator.svelte';
  import Avatar from '$lib/components/ui/avatar.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import TabsList from '$lib/components/ui/tabs-list.svelte';
  import TabsTrigger from '$lib/components/ui/tabs-trigger.svelte';
  import TabsContent from '$lib/components/ui/tabs-content.svelte';

  let showApiKey = $state(false);
  let currentApiKey = $derived($auth.apiKey || '');
  
  // Settings state
  let notificationsEnabled = $state(true);
  let autoRefresh = $state(true);
  let refreshInterval = $state(30);
  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    notifications.success('Settings saved successfully');
    saving = false;
  }

  function copyApiKey() {
    if (currentApiKey) {
      navigator.clipboard.writeText(currentApiKey);
      notifications.success('API key copied to clipboard');
    }
  }
</script>

<div class="space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
    <p class="text-muted-foreground">Manage your account and application preferences</p>
  </div>

  <Tabs value="account" class="space-y-6">
    <TabsList>
      {#snippet children()}
        <TabsTrigger value="account">
          {#snippet children()}
            <User class="mr-2 h-4 w-4" />
            Account
          {/snippet}
        </TabsTrigger>
        <TabsTrigger value="preferences">
          {#snippet children()}
            <Settings class="mr-2 h-4 w-4" />
            Preferences
          {/snippet}
        </TabsTrigger>
        <TabsTrigger value="notifications">
          {#snippet children()}
            <Bell class="mr-2 h-4 w-4" />
            Notifications
          {/snippet}
        </TabsTrigger>
      {/snippet}
    </TabsList>

    <!-- Account Tab -->
    <TabsContent value="account">
      {#snippet children()}
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Profile Card -->
          <Card class="lg:col-span-2">
            <CardHeader>
              {#snippet children()}
                <CardTitle>
                  {#snippet children()}Profile{/snippet}
                </CardTitle>
              {/snippet}
            </CardHeader>
            <CardContent>
              {#snippet children()}
                <div class="flex items-center gap-6">
                  <Avatar fallback="AD" size="lg" />
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold">Administrator</h3>
                    <p class="text-sm text-muted-foreground capitalize">{$auth.role || 'User'} Account</p>
                    <Badge variant="success">
                      {#snippet children()}Active{/snippet}
                    </Badge>
                  </div>
                </div>
              {/snippet}
            </CardContent>
          </Card>

          <!-- System Info -->
          <Card>
            <CardHeader>
              {#snippet children()}
                <CardTitle>
                  {#snippet children()}System{/snippet}
                </CardTitle>
              {/snippet}
            </CardHeader>
            <CardContent>
              {#snippet children()}
                <dl class="space-y-4 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Version</dt>
                    <dd class="font-medium">2.0.0</dd>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Protocol</dt>
                    <dd class="font-medium">ToIP v2</dd>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">API Status</dt>
                    <dd class="text-emerald-500 font-medium">Connected</dd>
                  </div>
                </dl>
              {/snippet}
            </CardContent>
          </Card>

          <!-- API Key -->
          <Card class="lg:col-span-3">
            <CardHeader>
              {#snippet children()}
                <div class="flex items-center gap-2">
                  <Key class="h-5 w-5 text-muted-foreground" />
                  <CardTitle>
                    {#snippet children()}API Key{/snippet}
                  </CardTitle>
                </div>
              {/snippet}
            </CardHeader>
            <CardContent>
              {#snippet children()}
                <div class="space-y-4">
                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={currentApiKey}
                        readonly
                        class="pr-10 font-mono"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onclick={() => showApiKey = !showApiKey}
                      >
                        {#if showApiKey}
                          <EyeOff class="h-4 w-4" />
                        {:else}
                          <Eye class="h-4 w-4" />
                        {/if}
                      </button>
                    </div>
                    <Button variant="outline" onclick={copyApiKey}>
                      {#snippet children()}Copy{/snippet}
                    </Button>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Your API key is used to authenticate requests to the Trust Registry API.
                  </p>
                </div>
              {/snippet}
            </CardContent>
          </Card>
        </div>
      {/snippet}
    </TabsContent>

    <!-- Preferences Tab -->
    <TabsContent value="preferences">
      {#snippet children()}
        <Card>
          <CardHeader>
            {#snippet children()}
              <CardTitle>
                {#snippet children()}Application Preferences{/snippet}
              </CardTitle>
            {/snippet}
          </CardHeader>
          <CardContent>
            {#snippet children()}
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Auto Refresh Data</label>
                    <p class="text-sm text-muted-foreground">Automatically refresh dashboard data</p>
                  </div>
                  <Switch bind:checked={autoRefresh} />
                </div>
                
                <Separator />

                {#if autoRefresh}
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Refresh Interval</label>
                    <select bind:value={refreshInterval} class="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm">
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                  <Separator />
                {/if}

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Compact Mode</label>
                    <p class="text-sm text-muted-foreground">Use a more compact layout</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <Button onclick={handleSave} disabled={saving}>
                  {#snippet children()}
                    {#if saving}
                      <span class="mr-2 h-4 w-4 animate-spin">⏳</span>
                    {:else}
                      <Save class="mr-2 h-4 w-4" />
                    {/if}
                    Save Changes
                  {/snippet}
                </Button>
              </div>
            {/snippet}
          </CardContent>
        </Card>
      {/snippet}
    </TabsContent>

    <!-- Notifications Tab -->
    <TabsContent value="notifications">
      {#snippet children()}
        <Card>
          <CardHeader>
            {#snippet children()}
              <CardTitle>
                {#snippet children()}Notification Settings{/snippet}
              </CardTitle>
            {/snippet}
          </CardHeader>
          <CardContent>
            {#snippet children()}
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Enable Notifications</label>
                    <p class="text-sm text-muted-foreground">Receive alerts for important events</p>
                  </div>
                  <Switch bind:checked={notificationsEnabled} />
                </div>

                <Separator />

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">New Issuer Registrations</label>
                    <p class="text-sm text-muted-foreground">Get notified when new issuers register</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <Separator />

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Status Changes</label>
                    <p class="text-sm text-muted-foreground">Get notified when entity status changes</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <Separator />

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Schema Updates</label>
                    <p class="text-sm text-muted-foreground">Get notified when schemas are updated</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <Button onclick={handleSave} disabled={saving}>
                  {#snippet children()}
                    {#if saving}
                      <span class="mr-2 h-4 w-4 animate-spin">⏳</span>
                    {:else}
                      <Save class="mr-2 h-4 w-4" />
                    {/if}
                    Save Changes
                  {/snippet}
                </Button>
              </div>
            {/snippet}
          </CardContent>
        </Card>
      {/snippet}
    </TabsContent>
  </Tabs>
</div>
