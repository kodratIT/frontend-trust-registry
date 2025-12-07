<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/stores';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import MainLayout from '$lib/components/layout/MainLayout.svelte';
  import Toast from '$lib/components/common/Toast.svelte';

  let { children } = $props();

  // Public routes that don't need auth
  const publicRoutes = ['/login'];
  const isPublicRoute = $derived(publicRoutes.includes($page.url.pathname));

  onMount(() => {
    // Initialize auth store from localStorage
    auth.init();
  });
</script>

<svelte:head>
  <title>Trust Registry | ToIP v2</title>
  <meta name="description" content="ToIP Trust Registry v2 Admin Dashboard" />
</svelte:head>

{#if isPublicRoute}
  {@render children()}
{:else}
  <MainLayout>
    {@render children()}
  </MainLayout>
{/if}

<Toast />
