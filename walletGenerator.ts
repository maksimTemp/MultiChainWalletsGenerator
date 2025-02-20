import { generateMnemonic } from 'bip39';
import { mnemonicNew } from "@ton/crypto";
import { WalletConfig } from './types/interfaces';
import { WalletData } from './models/WalletData';
import { WalletExporter } from './utils/WalletExporter';
import { BitcoinGenerator } from './generators/BitcoinGenerator';
import { EthereumGenerator } from './generators/EthereumGenerator';
import { SolanaGenerator } from './generators/SolanaGenerator';
import { TronGenerator } from './generators/TronGenerator';
import { TonV4Generator, TonV5Generator } from './generators/TonGenerator';
import { CosmosGenerator } from './generators/CosmosGenerator';
import { NetworkRegistry } from './types/NetworkRegistry';
import { SuiGenerator } from './generators/SuiGenerator';

/**
 * Main wallet generator class orchestrating the generation process
 */
export class WalletGenerator {
    private readonly wallets: WalletData[] = [];
    private readonly networkRegistry: NetworkRegistry;

    constructor(private readonly config: WalletConfig) {
        this.networkRegistry = NetworkRegistry.getInstance();
        
        this.networkRegistry.registerNetwork('bitcoin', {
            name: 'Bitcoin',
            generator: new BitcoinGenerator()
        });
        this.networkRegistry.registerNetwork('ethereum', {
            name: 'Ethereum',
            generator: new EthereumGenerator()
        });
        this.networkRegistry.registerNetwork('solana', {
            name: 'Solana',
            generator: new SolanaGenerator()
        });
        this.networkRegistry.registerNetwork('tron', {
            name: 'Tron',
            generator: new TronGenerator()
        });
        this.networkRegistry.registerNetwork('tonV4R2', {
            name: 'TonV4',
            generator: new TonV4Generator()
        });
        this.networkRegistry.registerNetwork('tonV5', {
            name: 'TonV5',
            generator: new TonV5Generator()
        });
        this.networkRegistry.registerNetwork('cosmos', {
            name: 'Cosmos',
            generator: new CosmosGenerator()
        });
        this.networkRegistry.registerNetwork('sui', {
            name: 'Sui',
            generator: new SuiGenerator()
        });
    }

    public getNetworkKeys(): string[] {
        return this.networkRegistry.getNetworkKeys();
    }

    /**
     * Generates a new BIP39 seed phrase
     */
    private async generateSeedPhrase(): Promise<string> {
        return generateMnemonic(256);
    }

    /**
     * Generates a new TON seed phrase
     */
    private async generateTonSeedPhrase(): Promise<string> {
        return (await mnemonicNew(24)).join(' ');
    }

    /**
     * Generates addresses for selected networks
     */
    private async generateNetworkAddresses(seedPhrase: string, tonSeedPhrase: string): Promise<Record<string, string>> {
        const addresses: Record<string, string> = {};
        const networkConfig = this.config.networks;

        const networkTasks = [
            { key: 'bitcoin', enabled: networkConfig.bitcoin, phrase: seedPhrase },
            { key: 'ethereum', enabled: networkConfig.ethereum, phrase: seedPhrase },
            { key: 'solana', enabled: networkConfig.solana, phrase: seedPhrase },
            { key: 'tron', enabled: networkConfig.tron, phrase: seedPhrase },
            { key: 'tonV4R2', enabled: networkConfig.tonV4R2, phrase: tonSeedPhrase },
            { key: 'tonV5R1', enabled: networkConfig.tonV5R1, phrase: tonSeedPhrase },
            { key: 'cosmos', enabled: networkConfig.cosmos, phrase: seedPhrase },
            { key: 'sui', enabled: networkConfig.sui, phrase: seedPhrase },
        ];

        for (const task of networkTasks) {
            if (task.enabled) {
                const networkInfo = this.networkRegistry.getNetworks().get(task.key);
                if (networkInfo) {
                    try {
                        addresses[task.key] = await networkInfo.generator.generateAddress(task.phrase);
                    } catch (error) {
                        console.error(`Error generating ${task.key} address:`, error);
                    }
                }
            }
        }

        return addresses;
    }

    /**
     * Generates wallets according to configuration
     */
    public async generateWallets(): Promise<void> {
        for (let i = 0; i < this.config.numberOfWallets; i++) {
            try {
                const seedPhrase = await this.generateSeedPhrase();
                const tonSeedPhrase = await this.generateTonSeedPhrase();
                
                const addresses = this.config.generateOnlySeedPhrase
                    ? {}
                    : await this.generateNetworkAddresses(seedPhrase, tonSeedPhrase);
                
                this.wallets.push(new WalletData(
                    seedPhrase,
                    this.config.networks.tonV4R2 || this.config.networks.tonV5R1 ? tonSeedPhrase : undefined,
                    addresses
                ));
            } catch (error) {
                console.error(`Error generating wallet ${i + 1}:`, error);
            }
        }
    }

    /**
     * Exports generated wallets to specified formats
     */
    public exportWallets(): void {
        if (this.wallets.length === 0) return;

        WalletExporter.exportToJson(this.wallets, this.config.outputPaths.json);
        WalletExporter.exportToCsv(
            this.wallets, 
            this.config.outputPaths.csv, 
            this.config,
        );
    }

    /**
     * Main execution method
     */
    public async run(): Promise<void> {
        try {
            await this.generateWallets();
            this.exportWallets();
        } catch (error) {
            console.error('Error running wallet generation:', error);
        }
    }
}