import React from 'react'

interface EBProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface EBState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
          <p className="text-[14px] font-medium text-[#0D2137]">Une erreur est survenue</p>
          <p className="text-[13px] text-[#8BAFC0]">Veuillez rafraîchir la page</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[12.5px] px-4 py-2 rounded-full border border-[#E5E7EB] bg-white text-[#4A7A94] hover:bg-[#F0F2F4] transition-all cursor-pointer"
          >
            Rafraîchir
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
