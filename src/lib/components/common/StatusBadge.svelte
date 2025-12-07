<script lang="ts">
  interface Props {
    status: string;
  }

  let { status }: Props = $props();

  const statusClasses: Record<string, string> = {
    // Entity status
    active: 'badge-active',
    inactive: 'badge-inactive',
    deprecated: 'badge-deprecated',
    pending: 'badge-pending',
    suspended: 'badge-suspended',
    revoked: 'badge-revoked',
    // Modes
    OPEN: 'badge-open',
    ECOSYSTEM: 'badge-ecosystem',
    GRANTOR: 'badge-grantor',
    // Accreditation
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
</script>

<span class="{statusClasses[status] || 'badge-aurora bg-space-600/50 text-slate-400 border border-space-500/50'}">
  {status}
</span>
