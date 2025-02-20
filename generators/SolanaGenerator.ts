import { NetworkWalletGenerator } from './BaseGenerator';
import { PublicKey } from '@solana/web3.js';
import { mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';

/**
 * Solana address generator
 */
export class SolanaGenerator extends NetworkWalletGenerator {
    /**
     * Generates a Solana address based on a 24-word seed phrase.
     * 
     * @param seedPhrase - A string containing a 24-word BIP39 mnemonic phrase.
     * @returns A promise that resolves to the Solana public address as a base58 encoded string.
     */
    async generateAddress(seedPhrase: string): Promise<string> {
        const seed = await mnemonicToSeed(seedPhrase);
        const { key } = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
        const keyPair = nacl.sign.keyPair.fromSeed(key);
        const publicKey = new PublicKey(keyPair.publicKey);
        return publicKey.toBase58();
    }
}