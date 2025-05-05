"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createDelegation, verifyDelegation } from "@/lib/delegation"
import { Loader2, AlertCircle, CheckCircle2, Wallet, Key, ShieldCheck, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DocumentTitle } from "@/components/document-title"

export function DelegationDemo() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [networkName, setNetworkName] = useState<string>("")

  const [delegatee, setDelegatee] = useState("")
  const [caveat, setCaveat] = useState("0x")
  const [delegationId, setDelegationId] = useState("")
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Create ethers provider
          const ethersProvider = new ethers.BrowserProvider(window.ethereum)
          setProvider(ethersProvider)

          // Get network
          const network = await ethersProvider.getNetwork()
          setNetworkName(network.name === "homestead" ? "Ethereum Mainnet" : network.name)

          // Check if already connected
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const ethersSigner = await ethersProvider.getSigner()
            setAddress(accounts[0])
            setSigner(ethersSigner)
            setIsConnected(true)
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length > 0) {
              setAddress(accounts[0])
              setIsConnected(true)
              ethersProvider.getSigner().then(setSigner)
            } else {
              setAddress(null)
              setSigner(null)
              setIsConnected(false)
            }
          })

          // Listen for network changes
          window.ethereum.on("chainChanged", () => {
            window.location.reload()
          })
        } catch (error) {
          console.error("Error setting up MetaMask:", error)
        }
      }
    }

    checkMetaMask()

    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)

          if (provider) {
            const ethersSigner = await provider.getSigner()
            setSigner(ethersSigner)
          }
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error)
        setError("Failed to connect to MetaMask. Please make sure it's installed and unlocked.")
      }
    } else {
      setError("MetaMask is not installed. Please install it to use this application.")
    }
  }

  // Disconnect from MetaMask
  const disconnectWallet = () => {
    setAddress(null)
    setSigner(null)
    setIsConnected(false)
  }

  // Reset states when connection changes
  useEffect(() => {
    setError("")
    setSuccess("")
    setVerificationResult(null)
    setDelegationId("")
  }, [isConnected])

  const handleCreateDelegation = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!delegatee) {
      setError("Please enter a delegatee address")
      return
    }

    setIsCreating(true)
    setError("")
    setSuccess("")

    try {
      const result = await createDelegation(address, delegatee, caveat, signer)
      setDelegationId(result.delegationId)
      setSuccess(`Delegation created successfully!`)
    } catch (err) {
      console.error(err)
      setError(`Failed to create delegation: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleVerifyDelegation = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!delegationId) {
      setError("Please enter a delegation ID")
      return
    }

    setIsVerifying(true)
    setError("")
    setSuccess("")
    setVerificationResult(null)

    try {
      const isValid = await verifyDelegation(delegationId, signer)
      setVerificationResult(isValid)
      setSuccess(isValid ? "Delegation is valid!" : "Delegation is invalid!")
    } catch (err) {
      console.error(err)
      setError(`Failed to verify delegation: ${err instanceof Error ? err.message : String(err)}`)
      setVerificationResult(null)
    } finally {
      setIsVerifying(false)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <>
      {delegationId && (
        <DocumentTitle title={`Delegation ${delegationId.substring(0, 8)} | MetaMask Delegation Portal`} />
      )}
      <Card className="w-full backdrop-blur-md bg-white/10 border-white/20 text-white shadow-xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Delegation Manager</CardTitle>
              <CardDescription className="text-white/70">
                Create and verify delegations using ERC-7715 and ERC-7710
              </CardDescription>
            </div>
            {isConnected && networkName && (
              <Badge variant="outline" className="text-white/70 border-white/20">
                {networkName}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="size-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                  <Wallet className="size-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Connect Your Wallet</h3>
                <p className="text-white/70 text-center max-w-md">
                  Connect your MetaMask wallet to create and verify delegations
                </p>
                <Button
                  onClick={connectWallet}
                  className="mt-4 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0"
                  size="lg"
                >
                  <Wallet className="mr-2 size-4" />
                  Connect MetaMask
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
                      <ShieldCheck className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Connected Wallet</p>
                      <p className="font-medium text-white">{address ? formatAddress(address) : ""}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="mr-2 size-4" />
                    Disconnect
                  </Button>
                </div>

                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 text-white">
                    <TabsTrigger
                      value="create"
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      <Key className="mr-2 size-4" />
                      Create Delegation
                    </TabsTrigger>
                    <TabsTrigger
                      value="verify"
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      <ShieldCheck className="mr-2 size-4" />
                      Verify Delegation
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="delegatee" className="text-white">
                        Delegatee Address
                      </Label>
                      <Input
                        id="delegatee"
                        placeholder="0x..."
                        value={delegatee}
                        onChange={(e) => setDelegatee(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-orange-500"
                      />
                      <p className="text-xs text-white/50">The address that will receive the delegation permissions</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="caveat" className="text-white">
                          Caveat (hex)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="size-4"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                  <path d="M12 17h.01" />
                                </svg>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-white/20">
                              <p className="max-w-xs">
                                Caveats define constraints on the delegation, such as time limits or specific
                                permissions
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="caveat"
                        placeholder="0x..."
                        value={caveat}
                        onChange={(e) => setCaveat(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-orange-500"
                      />
                      <p className="text-xs text-white/50">
                        Caveat is a hex string that defines the constraints of the delegation
                      </p>
                    </div>

                    <Button
                      onClick={handleCreateDelegation}
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0"
                      size="lg"
                    >
                      {isCreating && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Create Delegation
                    </Button>

                    {delegationId && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">Delegation ID</p>
                          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Created</Badge>
                        </div>
                        <p className="text-sm break-all text-white/70 font-mono">{delegationId}</p>
                        <p className="text-xs text-white/50 mt-2">Save this ID to verify the delegation later</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="verify" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="delegationId" className="text-white">
                        Delegation ID
                      </Label>
                      <Input
                        id="delegationId"
                        placeholder="Enter delegation ID"
                        value={delegationId}
                        onChange={(e) => setDelegationId(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-orange-500"
                      />
                      <p className="text-xs text-white/50">Enter the delegation ID you want to verify</p>
                    </div>

                    <Button
                      onClick={handleVerifyDelegation}
                      disabled={isVerifying}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0"
                      size="lg"
                    >
                      {isVerifying && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Verify Delegation
                    </Button>

                    {verificationResult !== null && (
                      <div
                        className={`p-4 rounded-lg border space-y-2 ${
                          verificationResult ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center">
                          {verificationResult ? (
                            <>
                              <CheckCircle2 className="size-5 text-green-400 mr-2" />
                              <p className="font-medium text-white">Valid Delegation</p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="size-5 text-red-400 mr-2" />
                              <p className="font-medium text-white">Invalid Delegation</p>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-white/70">
                          {verificationResult
                            ? "This delegation is valid and can be used"
                            : "This delegation is invalid or has been revoked"}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-white">
                <AlertCircle className="size-4 text-red-400" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 border-green-500/30 text-white">
                <CheckCircle2 className="size-4 text-green-400" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t border-white/10 pt-6">
          <p className="text-sm text-white/50">
            This demo uses the experimental ERC-7715 and ERC-7710 APIs from the MetaMask Delegation Toolkit SDK.
          </p>
        </CardFooter>
      </Card>
    </>
  )
}
