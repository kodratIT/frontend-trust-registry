<script lang="ts">
  interface Props {
    type?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
    id?: string;
  }

  let { type = 'text', value = $bindable(''), placeholder = '', disabled = false, readonly = false, class: className = '', id }: Props = $props();
</script>

<input
  {type}
  {id}
  bind:value
  {placeholder}
  {disabled}
  {readonly}
  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {className}"
/>
