# Rebar Shield Reference Implementation

## Overview

This is a minimal reference implementation for sending Private Transactions through Rebar Shield as outlined in the [Rebar Shield documentation](https://docs.rebarlabs.io). 

The application demonstrates how to construct Bitcoin transactions that follow the Rebar Shield protocol requirements, enabling private transaction relay.

## Rebar Transaction Validity Requirements

For a transaction to be processed by Rebar Shield, it must:

1. Not pay less than the minimum sats/vB fee rate indicated by the `/info` endpoint
2. Pay the fee to a p2wpkh output provided by the `/info` endpoint
3. Pay 0 sats in standard Bitcoin fees

## Technology Stack

This application is built with:

- Vite + React
- TypeScript
- [@scure/btc-signer](https://github.com/paulmillr/scure-btc-signer) for transaction construction
- [LaserEyes](https://www.lasereyes.build/) for wallet connectivity
- Unisat wallet integration

## Getting Started

### Prerequisites

- Node.js
- pnpm (or npm/yarn)
- Unisat wallet extension installed in your browser

### Installation and Running

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

## Usage

1. Connect your Unisat wallet
2. Enter a recipient Bitcoin address
3. Specify the amount to send (in satoshis)
4. Build the transaction
5. Sign the transaction with your wallet
6. Send the transaction through Rebar Shield

## Additional Wallet Support

This reference implementation currently supports Unisat wallet. For information on connecting additional wallets, please refer to [LaserEyes documentation](https://lasereyes.build).

## How It Works

The application:
1. Constructs a PSBT according to Rebar Shield protocol requirements
2. Uses the connected wallet to sign the transaction
3. Submits the signed transaction to the Rebar Shield API
4. Provides transaction status monitoring

## Project Structure

- `src/App.tsx`: Main application component and UI
- `src/lib/tools.ts`: Core functionality for transaction building, signing, and submission

## Important Disclaimer

**This codebase is intended to be a small working example of interaction with Rebar Shield. It is NOT intended for production use under any circumstances.**

Key limitations:
- This code has not been audited
- Error handling is minimal
- The implementation does not include all security best practices
- Use at your own risk

## Development

For those looking to extend or modify this reference:

```bash
# Run linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Resources

- [Rebar Shield Documentation](https://docs.rebarlabs.io)
- [GitHub Repository](https://github.com/rebarsoftware/rebar-shield-reference)
- [LaserEyes Documentation](https://lasereyes.build)

## License

Please refer to the repository license file for details.

### Disclaimer

This is a demo reference implementation and is not intended for use in production and is provided as-is, with the warranties of fitness for purpose, merchantability, and all other warranties expressly disclaimed.  The code is not audited and you use this at your own risk and Rebar Labs, Inc., its officers, directors, and/or shareholders shall have no liability to you.  You are solely responsible for assessing and understanding this demo reference implementation and for any decision you make to run it and/or integrate it with any system or network.
