<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import Loading from './Loading.svelte';
  import EmptyState from './EmptyState.svelte';
  import Pagination from './Pagination.svelte';

  interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: Snippet<[T]>;
  }

  interface Props {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    page?: number;
    totalPages?: number;
    total?: number;
    limit?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    onPageChange?: (page: number) => void;
    onRowClick?: (item: T) => void;
  }

  let { 
    data, 
    columns, 
    loading = false,
    page = 1,
    totalPages = 1,
    total = 0,
    limit = 10,
    emptyTitle = 'No data found',
    emptyDescription = 'There are no items to display.',
    onPageChange,
    onRowClick
  }: Props = $props();

  function getValue(item: T, key: string): unknown {
    return key.split('.').reduce((obj, k) => (obj as Record<string, unknown>)?.[k], item as unknown);
  }
</script>

<div class="card-aurora overflow-hidden">
  {#if loading}
    <Loading fullPage />
  {:else if data.length === 0}
    <EmptyState title={emptyTitle} description={emptyDescription} />
  {:else}
    <div class="overflow-x-auto">
      <table class="table-aurora">
        <thead>
          <tr>
            {#each columns as column}
              <th style={column.width ? `width: ${column.width}` : ''}>
                {column.label}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data as item, index}
            <tr 
              class={onRowClick ? 'cursor-pointer' : ''}
              onclick={() => onRowClick?.(item)}
              onkeydown={(e) => e.key === 'Enter' && onRowClick?.(item)}
              role={onRowClick ? 'button' : undefined}
              tabindex={onRowClick ? 0 : undefined}
            >
              {#each columns as column}
                <td>
                  {#if column.render}
                    {@render column.render(item)}
                  {:else}
                    {getValue(item, column.key) ?? '-'}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if onPageChange && totalPages > 1}
      <Pagination {page} {totalPages} {total} {limit} {onPageChange} />
    {/if}
  {/if}
</div>
