import { IWalletAddresses } from '../types/interfaces';

/**
 * Represents a generated wallet with its addresses
 */
export class WalletData {
    constructor(
        public readonly seedPhrase: string,
        public readonly tonSeedPhrase?: string,
        public readonly addresses: IWalletAddresses = {}
    ) {}
}