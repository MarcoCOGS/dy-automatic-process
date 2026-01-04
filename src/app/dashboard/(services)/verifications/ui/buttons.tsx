'use client';

import { DownloadIcon, GripIcon } from 'lucide-react';
import Link from 'next/link';
import Pusher, { Channel } from 'pusher-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { ReporteToast } from '@/components/ui/reporte-toast';
import { generateDefaultReport } from '../lib/api';


export function DownloadVerifications() {
  const { t } = useTranslation('es');
  const [, setPusher] = useState<Pusher | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusherInstance = new Pusher('process.env.NEXT_PUBLIC_PUSHER_KEY', {
      cluster: 'process.env.NEXT_PUBLIC_PUSHER_CLUSTER',
    });

    pusherInstance.connection.bind('connected', () => {});

    const reportsChannel = pusherInstance.subscribe('reports-channel');
    setPusher(pusherInstance);
    setChannel(reportsChannel);

    return () => {
      reportsChannel.unbind_all();
      pusherInstance.unsubscribe('reports-channel');
      pusherInstance.disconnect();
    };
  }, []);

  const handleDownload = async () => {
    toast.info('Generando reporte...', {
      description: 'Por favor espera mientras se procesa el reporte.',
      duration: 5000,
    });

    if (!channel) {
      return;
    }

    try {
      await generateDefaultReport();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      channel.bind('report-generated', (data: any) => {
        toast.custom(() => (
          <ReporteToast
            reportId={data.reportId}
            url={data.url.value}
            duration={data.expiresIn * 1000}
          />
        ), {
          duration: data.expiresIn * 1000
        })

        channel.unbind('report-generated');
      });
    } catch (error) {
      console.error('Error al generar el reporte', error);
    }
  };

  return (
    <Button variant='outline' onClick={handleDownload}>
      <DownloadIcon className='mr-2' />
      {t('buttons.download')}
    </Button>
  );
}

export function ViewVerification({ code }: { code: string }) {
  return (
    <Button variant='link' asChild>
      <Link href={`/dashboard/verifications/${code}`}>
        <GripIcon className='h-5 w-5' />
      </Link>
    </Button>
  );
}
