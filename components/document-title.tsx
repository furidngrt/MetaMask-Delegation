"use client"

import { useEffect } from "react"

interface DocumentTitleProps {
  title: string
}

export function DocumentTitle({ title }: DocumentTitleProps) {
  useEffect(() => {
    // Update the document title
    document.title = title

    // Clean up when component unmounts
    return () => {
      document.title = "MetaMask Delegation Portal"
    }
  }, [title])

  // This component doesn't render anything
  return null
}
