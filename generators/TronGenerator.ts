import { NetworkWalletGenerator } from './BaseGenerator';
import { mnemonicToSeed } from 'bip39';
import HDKey from 'hdkey';
import TronWeb from 'tronweb';

/**
 * Tron address generator
 */
export class TronGenerator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        try {
            const seed = await mnemonicToSeed(seedPhrase);
            const root = HDKey.fromMasterSeed(seed);
            const derived = root.derive("m/44'/195'/0'/0/0");
            
            if (!derived.privateKey) {
                throw new Error('Failed to derive private key');
            }

            const tronWeb = new TronWeb.TronWeb({ 
                fullHost: 'https://api.trongrid.io' 
            });

            const privateKeyHex = derived.privateKey.toString('hex');
            const address = tronWeb.address.fromPrivateKey(privateKeyHex);

            if (!address) {
                throw new Error('Failed to generate address from private key');
            }

            return address.toString();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error generating TRON address:', errorMessage);
            throw new Error(`Failed to generate TRON address: ${errorMessage}`);
        }
    }
}