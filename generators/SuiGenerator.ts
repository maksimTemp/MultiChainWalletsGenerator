import { NetworkWalletGenerator } from './BaseGenerator';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

/**
 * SUI address generator
 */
export class SuiGenerator extends NetworkWalletGenerator {
    /**
     * Generates a SUI address from a 24-word mnemonic phrase.
     * 
     * @param seedPhrase - Space-separated 24-word mnemonic phrase
     * @returns Promise resolving to the SUI address string
     */
    async generateAddress(seedPhrase: string): Promise<string> {
        const derivationPath = "m/44'/784'/0'/0'/0'";

        const keypair = Ed25519Keypair.deriveKeypair(
            seedPhrase, derivationPath
        );
        
        return keypair.getPublicKey().toSuiAddress();
    }
}
