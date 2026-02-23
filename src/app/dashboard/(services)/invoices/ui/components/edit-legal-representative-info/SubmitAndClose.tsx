'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateLegalRepresentativeInfoAction } from '../../../[code]/actions'

export function SubmitAndClose({ code }: { code: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    updateLegalRepresentativeInfoAction.bind(null, code),
    { ok: false }
  )

  useEffect(() => {
    if (state.ok) router.back() // ✅ cierra el modal de verdad
  }, [state.ok, router])

  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => router.back()}
        disabled={pending}
      >
        Cancelar
      </Button>

      <Button type="submit" className='w-[116px]' formAction={formAction} disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </Button>
    </div>
  )
}
