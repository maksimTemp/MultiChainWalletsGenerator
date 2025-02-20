export abstract class NetworkWalletGenerator {
    /**
     * Generates a blockchain-specific address from a seed phrase
     * @param seedPhrase - BIP39 mnemonic phrase
     * @returns Generated address
     */
    abstract generateAddress(seedPhrase: string): Promise<string>;
}