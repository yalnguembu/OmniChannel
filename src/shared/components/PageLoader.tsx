import { Loader } from "lucide-react"

const PageLoader = () => (
  <div className="flex w-full h-full min-h-[400px] items-center justify-center">
    <Loader className="size-8 animate-spin text-primary" />
  </div>
)

export default PageLoader
