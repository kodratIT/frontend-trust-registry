<script lang="ts">
  import { notifications } from '$lib/stores';
  import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'border-aurora-mint/50 bg-aurora-mint/10 text-aurora-mint',
    error: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
    warning: 'border-aurora-gold/50 bg-aurora-gold/10 text-aurora-gold',
    info: 'border-aurora-sky/50 bg-aurora-sky/10 text-aurora-sky',
  };
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
  {#each $notifications as notification (notification.id)}
    {@const Icon = icons[notification.type]}
    <div class="flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-up {colors[notification.type]}">
      <Icon class="w-5 h-5 flex-shrink-0" />
      <span class="text-sm font-medium">{notification.message}</span>
      <button 
        class="ml-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        onclick={() => notifications.dismiss(notification.id)}
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
