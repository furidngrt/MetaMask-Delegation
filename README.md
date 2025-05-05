# MetaMask Delegation Demo

This project demonstrates the use of the experimental ERC-7715 and ERC-7710 APIs from the MetaMask Delegation Toolkit SDK.

## Overview

The MetaMask Delegation Demo is a web application that allows users to:

1. Connect their MetaMask wallet
2. Create delegations using ERC-7715
3. Verify delegations using ERC-7710
4. View delegation details

This project showcases how delegation can be used to grant specific permissions to other addresses without giving full wallet access.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/furidngrt/MetaMask-Delegation-Demo.git
   cd metamask-delegation-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## How ERC-7715 and ERC-7710 are Used

### ERC-7715: Creating Delegations

The project uses the ERC-7715 API to create delegations. This is implemented in the `createDelegation` function in `lib/delegation.ts`:

```typescript
export async function createDelegation(
  delegator: string,
  delegatee: string,
  caveat = "0x",
  signer: ethers.JsonRpcSigner | null
) {
  try {
    // Create a delegation using ERC-7715
    const delegation = await delegationRegistry.createDelegation(
      {
        delegator,
        delegatee,
        caveat,
        type: "eip712", // Using EIP-712 for structured data signing
      },
      signer
    );

    return {
      delegationId: delegation.delegationId,
      delegation,
    };
  } catch (error) {
    console.error("Error creating delegation:", error);
    throw error;
  }
}
```

When a user creates a delegation, they:
1. Specify a delegatee address (the address receiving the delegation)
2. Optionally provide a caveat (constraints on the delegation)
3. Sign the delegation using their MetaMask wallet

The delegation is then stored and a delegation ID is returned.

### ERC-7710: Verifying Delegations

The project uses the ERC-7710 API to verify delegations. This is implemented in the `verifyDelegation` function in `lib/delegation.ts`:

```typescript
export async function verifyDelegation(
  delegationId: string,
  signer: ethers.JsonRpcSigner | null
): Promise<boolean> {
  try {
    // Verify the delegation using ERC-7710
    const isValid = await delegationRegistry.verifyDelegation(delegationId, signer);
    return isValid;
  } catch (error) {
    console.error("Error verifying delegation:", error);
    throw error;
  }
}
```

When a user verifies a delegation, they:
1. Enter a delegation ID
2. The application checks if the delegation is valid using the ERC-7710 API
3. The result is displayed to the user

## Implementation Notes

For this demo, we've created a simplified mock implementation of the MetaMask Delegation Toolkit to demonstrate the concepts. In a production environment, you would:

1. Install the actual MetaMask Delegation Toolkit:
   ```bash
   npm install @metamask/delegation-toolkit
   ```

2. Import and use the actual implementation:
   ```typescript
   import { DelegationRegistry } from "@metamask/delegation-toolkit"
   ```

The mock implementation in this demo follows the same API structure as the actual toolkit, so the code can be easily updated once the experimental APIs are publicly available.

## Wallet Connection

This project uses ethers.js to connect to MetaMask:

```typescript
// Create ethers provider
const ethersProvider = new ethers.BrowserProvider(window.ethereum);
setProvider(ethersProvider);

// Get signer
const ethersSigner = await ethersProvider.getSigner();
setSigner(ethersSigner);
```

## Project Structure

- `app/`: Next.js app directory
- `components/`: React components
  - `delegation-demo.tsx`: Main component for delegation functionality
  - `ui/`: UI components (buttons, cards, etc.)
- `lib/`: Utility functions
  - `delegation.ts`: Functions for interacting with the MetaMask Delegation Toolkit

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- ethers.js for Ethereum interactions
- MetaMask Delegation Toolkit SDK (mocked)

## Future Enhancements

- Add support for more complex caveats
- Implement delegation revocation
- Add a dashboard to view all active delegations
- Support for multiple wallet providers
