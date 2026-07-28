import { LoaderCircle } from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-3 text-sm font-medium text-sky-300">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span>Analyzing repository...</span>
    </div>
  )
}

export default LoadingSpinner
