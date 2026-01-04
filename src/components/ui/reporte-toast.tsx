import { useEffect, useState } from 'react'

export function ReporteToast({
  reportId,
  url,
  duration
}: {
  reportId: string
  url: string
  duration: number // en milisegundos
}) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const percentage = Math.max(100 - (elapsed / duration) * 100, 0)
      setProgress(percentage)
    }, 100)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="w-[356px] p-2 rounded-lg border-[1.5px] border-gray-200 px-3">

      <div className='flex justify-between flex-row'>
        <div className='flex items-center'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>
        </div>
        <div className='mx-2'>
          <p className="font-medium text-[13px] text-black">Reporte generado con éxito</p>
          <p className="text-[13px] text-gray-600 mb-2">
            El reporte {reportId}.xlsx ya está listo.
          </p>
        </div>
        <div className="flex flex-col w-24 items-center justify-center">
          <button
            onClick={() => (window.location.href = url)}
            className="text-[13px] bg-black text-white px-2 py-0.5 self-center rounded hover:bg-gray-800 transition"
          >
            Abrir
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative mt-3 h-1 w-full bg-gray-300 rounded overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-black transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
