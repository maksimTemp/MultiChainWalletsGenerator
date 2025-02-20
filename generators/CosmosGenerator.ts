import { NetworkWalletGenerator } from './BaseGenerator';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

/**
 * Cosmos address generator
 */
export class CosmosGenerator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seedPhrase);
        const [account] = await wallet.getAccounts();
        return account.address;
    }
}