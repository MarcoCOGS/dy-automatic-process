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
import { checkInvoiceStatusAction, requestVerifications } from '../actions';


const fileSizeLimit = 1024 * 1024 * 10;

const xlsxFileType = mime.lookup('xlsx') as string;
const pdfFileType = mime.lookup('pdf') as string;
const imageTypes = [
  mime.lookup('jpg') as string,
  mime.lookup('jpeg') as string,
  mime.lookup('png') as string,
  mime.lookup('webp') as string,
  mime.lookup('svg') as string,
];

const formSchema = z
  .object({
    invoiceNumber: z
      .string({
        required_error: 'Debes ingresar el número de factura.',
      })
      .min(1, 'Debes ingresar el número de factura.'),
    invoice:
      typeof window === 'undefined'
        ? z.any()
        : z
            .preprocess(
              (v) => (v instanceof FileList ? v : undefined),
              z.instanceof(FileList).optional(),
            )
            .refine((files) => !!files && files.length === 1, 'Debes subir la factura.')
            .refine(
              (files) => {
                if (!files?.length) return true;
                const type = mime.lookup(files[0].name);
                return type === pdfFileType || type === xlsxFileType;
              },
              'La factura debe ser PDF o Excel (.xlsx).',
            )
            .refine(
              (files) => {
                if (!files?.length) return true;
                return files[0].size <= fileSizeLimit;
              },
              'La factura es demasiado grande. Máximo 10MB.',
            ),
    productPhotos:
      typeof window === 'undefined'
        ? z.any()
        : z
            .preprocess(
              (v) => (v instanceof FileList ? v : undefined),
              z
                .instanceof(FileList)
                .refine((files) => files.length <= 3, 'Puedes subir como máximo 3 archivos.')
                .refine(
                  (files) =>
                    !files.length ||
                    Array.from(files).every((f) => imageTypes.includes(mime.lookup(f.name) as string)),
                  'Las fotos deben ser imágenes (JPG, PNG, WEBP).',
                )
                .refine(
                  (files) => !files.length || Array.from(files).every((f) => f.size <= fileSizeLimit),
                  'Alguna foto supera el tamaño máximo de 10MB.',
                )
                .optional(),
            ),
    extraInfo:
      typeof window === 'undefined'
        ? z.any()
        : z
            .preprocess(
              (v) => (v instanceof FileList ? v : undefined),
              z
                .instanceof(FileList)
                .refine((files) => files.length <= 3, 'Puedes subir como máximo 3 archivos.')
                .refine(
                  (files) => !files.length || Array.from(files).every((f) => f.size <= fileSizeLimit),
                  'Algún archivo adicional supera el tamaño máximo de 10MB.',
                )
                .optional(),
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
  const [invoiceId, setinvoiceId] = useState<undefined | string | null>(null)
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: FormValues) {
    // if (submittingRef.current) return;
    submittingRef.current = true;
    startTransition(async () => {
      const formData = new FormData();
      const invoiceNumber = data.invoiceNumber
      if(invoiceNumber) formData.append('invoiceNumber', invoiceNumber);

      const invoiceFile = data.invoice?.[0];
      if (invoiceFile) {
        formData.append('invoice', invoiceFile);
      }

      const photoFiles = data.productPhotos;
      if (photoFiles?.length) {
        Array.from(photoFiles).forEach((file) => {
          formData.append('productPhotos', file as Blob);
        });
      }

      const extraFiles = data.extraInfo;
      if (extraFiles?.length) {
        Array.from(extraFiles).forEach((file) => {
          formData.append('extraInfo', file as Blob);
        });
      }
      const response = await tryCatch(requestVerifications(formData));

      if (response.error) {
        toast('Error interno, contacte al administrador', {
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
          setinvoiceId(response.data.invoiceId)
          form.reset();
          submittingRef.current = false;
        } else {
          setMessage(response.data.message);
          setIsLoading(false)
        }
      }

    });
  }

  function onOpenChange(open: boolean) {
    if (open) {
      setMessage('');
    } else {
      form.reset();
      setOpen(false)

      // if (hasEverSucceeded) {
      //   startTransition2(() => {
      //     setMessage('');
      //     router.refresh();
      //   });
      // }
    }
  }

useEffect(() => {
  if (!invoiceId) return;

  let cancelled = false;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    try {
      const response = await tryCatch(checkInvoiceStatusAction(invoiceId));

      if (response?.data?.invoiceId) {
        if (!cancelled) {
          setinvoiceId(null);
          setIsLoading(false)
          toast('Error interno, contacte al administrador', {
            description: response.data.message,
          });
        }
        return;
      }

      if (response?.data?.success) {
        if (!cancelled) {
          setinvoiceId(null);
          setIsLoading(false)
          router.refresh();
        }
        return;
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, 5000);
      }
    } catch (error) {
      console.error(error);

      if (!cancelled) {
        timeoutId = setTimeout(poll, 5000);
      }
    }
  };

  poll();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [invoiceId]);

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogTrigger asChild>
          <Button variant='outline' type='submit' onClick={() => setOpen(true)}>
            <FilePlus2Icon />
            Carga de documentos
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carga de documentos para generacion de Factura</DialogTitle>
            <DialogDescription>
              Sube tus documentos para clasificación Arancelaria automática con IA y genera una Factura
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8' autoComplete='false'>
              <FormField
                control={form.control}
                name='invoiceNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de factura</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Ingresa Número de factura'
                        disabled={isPending}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        onChange={(e) => field.onChange(e.target.value)}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        multiple
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
                  Procesar archivos
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
      <Backdrop open={isLoading} variant='blur'>
        <div className='animate-pulse'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      </Backdrop>
    </>
  );
}
