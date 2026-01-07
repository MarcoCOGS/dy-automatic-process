'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, FilePlus2Icon, Loader2 } from 'lucide-react';
import mime from 'mime-types';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/app/i18n/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Backdrop } from '@/components/ui/backdrop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { tryCatch } from '@/lib/try-catch';
import { checkBatchStatusAction, requestVerifications } from '../actions';


const fileSizeLimit = 1024 * 1024 * 10;

const xlsxFileType = mime.lookup('xlsx') as string;
const pdfFileType = mime.lookup('pdf') as string;
const imageTypes = [
  mime.lookup('jpg') as string,
  mime.lookup('jpeg') as string,
  mime.lookup('png') as string,
  mime.lookup('webp') as string,
];

const formSchema = z
  .object({
    // Factura (obligatoria)
    invoice:
      typeof window === 'undefined'
        ? z.any()
        : z
            .instanceof(FileList)
            .refine((file) => file.length === 1, 'Debes subir la factura.')
            .refine(
              (file) => {
                if (!file.length) return true;
                const type = mime.lookup(file[0].name);
                return type === pdfFileType || type === xlsxFileType;
              },
              'La factura debe ser PDF o Excel (.xlsx).',
            )
            .refine(
              (file) => !file.length || file[0].size <= fileSizeLimit,
              'La factura es demasiado grande. Máximo 10MB.',
            ),

    // Fotos de productos (al menos 1 imagen)
    productPhotos:
      typeof window === 'undefined'
        ? z.any()
        : z
            .instanceof(FileList)
            .refine((files) => files.length >= 1, 'Debes subir al menos una foto de producto.')
            .refine(
              (files) =>
                !files.length ||
                Array.from(files).every((f) => imageTypes.includes(mime.lookup(f.name) as string)),
              'Las fotos deben ser imágenes (JPG, PNG, WEBP).',
            )
            .refine(
              (files) =>
                !files.length || Array.from(files).every((f) => f.size <= fileSizeLimit),
              'Alguna foto supera el tamaño máximo de 10MB.',
            ),

    // Info adicional (opcional)
    extraInfo:
      typeof window === 'undefined'
        ? z.any()
        : z
            .instanceof(FileList)
            .refine(
              (files) => !files.length || files[0].size <= fileSizeLimit,
              'El archivo adicional es demasiado grande. Máximo 10MB.',
            ),
  });

type FormValues = z.infer<typeof formSchema>;

export default function RequestVerifications() {
  const { t } = useTranslation('es', 'verifications');
  const submittingRef = useRef(false);
  console.log(t)
  const [isPending, startTransition] = useTransition();
  // const [isPending2, startTransition2] = useTransition();
  const router = useRouter();
  // const [hasEverSucceeded, setHasEverSucceeded] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [batchId, setBatchId] = useState<undefined | string | null>(null)
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: FormValues) {
    if (submittingRef.current) return;
  submittingRef.current = true;
    startTransition(async () => {
      const formData = new FormData();

      const invoiceFile = data.invoice?.[0];
      if (invoiceFile) {
        formData.append('invoice', invoiceFile);
      }

      // const photoFiles = data.productPhotos;
      // if (photoFiles?.length) {
      //   Array.from(photoFiles).forEach((file, index) => {
      //     formData.append(`productPhotos[${index}]`, file as Blob);
      //   });
      // }

      const photoFiles = data.productPhotos?.[0];
      if (photoFiles) {
        formData.append('productPhotos', photoFiles);
      }

      const extraFile = data.extraInfo?.[0];
      if (extraFile) {
        formData.append('extraInfo', extraFile);
      }
      console.log('aca requestVerifications client')
      const response = await tryCatch(requestVerifications(formData));

      if (response.error) {
        toast('Uh oh! Something went wrong.', {
          description: response.error.message,
        });
      } else {
        if (response.data.success) {
          toast('Notice', {
            description: response.data.message,
          });

          setMessage('');
          // setHasEverSucceeded(true);
          setIsLoading(true)
          setOpen(false)
          setBatchId(response.data.batchId)
        } else {
          setMessage(response.data.message);
        }

        // form.reset();
      }
    });
  }

  // function onOpenChange(open: boolean) {
  //   if (open) {
  //     setMessage('');
  //   } else {
  //     form.reset();

  //     // if (hasEverSucceeded) {
  //     //   startTransition2(() => {
  //     //     setMessage('');
  //     //     router.refresh();
  //     //   });
  //     // }
  //   }
  // }

useEffect(() => {
  if (!batchId) return;

  let cancelled = false;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    try {
      console.log('aca checkBatchStatusAction client')
      const response = await tryCatch(checkBatchStatusAction(batchId));

      if (response?.data?.success) {
        if (!cancelled) {
          setBatchId(null);
          setIsLoading(false)
          router.refresh();
        }
        return;
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, 2000);
      }
    } catch (error) {
      console.error(error);

      if (!cancelled) {
        timeoutId = setTimeout(poll, 2000);
      }
    }
  };

  poll();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [batchId]);

  return (
    <>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button variant='outline' type='submit' onClick={() => setOpen(true)}>
            <FilePlus2Icon />
            Solicitar Verificaciones
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sistema de Clasificación Arancelaria</DialogTitle>
            <DialogDescription>
              Sube tus documentos para clasificación automática con IA
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Factura */}
              <FormField
                control={form.control}
                name='invoice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factura Comercial (PDF / Excel)</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        accept={`${pdfFileType},${xlsxFileType}`}
                        disabled={isPending}
                        // react-hook-form maneja FileList con onChange + ref
                        onChange={(e) => field.onChange(e.target.files)}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Formato permitido: PDF / .xlsx | Tamaño máximo: 10MB.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fotos de productos */}
              <FormField
                control={form.control}
                name='productPhotos'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fotos de Productos</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        multiple
                        accept='image/*'
                        disabled={isPending}
                        onChange={(e) => field.onChange(e.target.files)}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Puedes subir varias imágenes | Tamaño máximo por imagen: 10MB.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Información adicional */}
              <FormField
                control={form.control}
                name='extraInfo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información Adicional (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        disabled={isPending}
                        onChange={(e) => field.onChange(e.target.files)}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Archivo opcional | Tamaño máximo: 10MB.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button disabled={isPending} type='submit'>
                  {isPending && <Loader2 className='h-5 w-5 animate-spin' />}
                  Procesar archivo
                </Button>
              </DialogFooter>
            </form>
          </Form>
          {message.length > 0 && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <pre>{message}</pre>
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
      {/* <Backdrop open={isPending2} variant='blur'>
        <div className='animate-pulse'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      </Backdrop> */}
      <Backdrop open={isLoading} variant='blur'>
        <div className='animate-pulse'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      </Backdrop>
    </>
  );
}
