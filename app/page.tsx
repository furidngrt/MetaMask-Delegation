import type { Metadata } from "next"
import { DelegationDemo } from "@/components/delegation-demo"

export const metadata: Metadata = {
  title: "MetaMask Delegation Portal | Secure Permission Management",
  description: "Delegate specific permissions to other addresses using the MetaMask Delegation Toolkit",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 text-white"
              >
                <path d="M19 12H5" />
                <path d="M12 19V5" />
              </svg>
            </div>
            <span className="font-bold text-white text-xl">Delegation Portal</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="https://github.com/furidngrt/MetaMask-Delegation-Demo" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              GitHub
            </a>
          </nav>
          <button className="md:hidden text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
                MetaMask Delegation
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Securely delegate specific permissions to other addresses without giving full wallet access
            </p>
          </div>
          <DelegationDemo />
        </section>
      </main>
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-white/50">
          <p>Built with the MetaMask Delegation Toolkit SDK • ERC-7715 & ERC-7710</p>
        </div>
      </footer>
    </div>
  )
}
