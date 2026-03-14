'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">حدث خطأ ما</h1>
                <p className="text-muted-foreground mb-4">
                  {this.state.error?.message ||
                    'حدث خطأ غير متوقع. يرجى المحاولة مجدداً'}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  العودة للرئيسية
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  إعادة تحميل الصفحة
                </Button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
