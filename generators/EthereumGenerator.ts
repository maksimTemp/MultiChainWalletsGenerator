import { NetworkWalletGenerator } from './BaseGenerator';
import { ethers } from 'ethers';

/**
 * Ethereum address generator
 */
export class EthereumGenerator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        const wallet = ethers.Wallet.fromPhrase(seedPhrase);
        return wallet.address;
    }
}