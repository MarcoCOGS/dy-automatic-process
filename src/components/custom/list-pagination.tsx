'use client';

import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ListPaginationProps = {
  basePath: string;
  meta: PaginationMeta;
  itemCount: number;
};

export function ListPagination({ basePath, meta, itemCount }: ListPaginationProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const totalPages = Math.max(meta.totalPages, 1);
  const currentPage = Math.min(meta.page, totalPages);
  const from = itemCount === 0 ? 0 : (currentPage - 1) * meta.limit + 1;
  const to = itemCount === 0 ? 0 : from + itemCount - 1;

  const pageHref = (page: number) => {
    const params = new URLSearchParams();

    params.set('page', String(page));
    params.set('limit', String(meta.limit));

    return `${basePath}?${params.toString()}`;
  };

  const refresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  return (
    <div className='flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
      <div>
        Mostrando {from}-{to} de {meta.total} registros. Pagina {currentPage} de {totalPages}.
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={cn(isRefreshing && 'animate-spin')} />
          Actualizar
        </Button>
        {meta.hasPreviousPage ? (
          <Button variant='outline' size='sm' asChild>
            <Link href={pageHref(currentPage - 1)}>
              <ChevronLeft />
              Anterior
            </Link>
          </Button>
        ) : (
          <Button type='button' variant='outline' size='sm' disabled>
            <ChevronLeft />
            Anterior
          </Button>
        )}
        {meta.hasNextPage ? (
          <Button variant='outline' size='sm' asChild>
            <Link href={pageHref(currentPage + 1)}>
              Siguiente
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button type='button' variant='outline' size='sm' disabled>
            Siguiente
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}
