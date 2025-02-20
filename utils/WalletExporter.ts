import fs from 'fs';
import { WalletData } from '../models/WalletData';
import { WalletConfig } from '../types/interfaces';
import { NetworkRegistry } from '../types/NetworkRegistry';

/**
 * Handles data export operations
 */
export class WalletExporter {
    /**
     * Exports wallet data to JSON format
     */
    static exportToJson(wallets: WalletData[], filePath: string): void {
        try {
            const data = JSON.stringify(wallets, null, 2);
            fs.writeFileSync(filePath, data);
            console.log(`JSON file successfully exported to: ${filePath}`);
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            throw error;
        }
    }

    /**
     * Gets headers for CSV based on registered networks and configuration
     */
    private static getHeaders(config: WalletConfig): string[] {
        const headers = ['seedPhrase'];
        const registry = NetworkRegistry.getInstance();
        const networks = registry.getNetworks();

        const hasSpecialSeedNetworks = Array.from(networks.values())
            .some(info => info.requiresSpecialSeed && config.networks[info.name as keyof typeof config.networks]);

        if (hasSpecialSeedNetworks) {
            headers.push('tonSeedPhrase');
        }

        for (const [key, info] of networks) {
            if (config.networks[key as keyof typeof config.networks]) {
                headers.push(key);
            }
        }

        return headers;
    }

    /**
     * Gets row values based on headers
     */
    private static getRowValues(wallet: WalletData, headers: string[]): string[] {
        return headers.map(header => {
            switch (header) {
                case 'seedPhrase':
                    return wallet.seedPhrase;
                case 'tonSeedPhrase':
                    return wallet.tonSeedPhrase || '';
                default:
                    return wallet.addresses[header as keyof typeof wallet.addresses] || '';
            }
        });
    }

    /**
     * Escapes a value for CSV format
     */
    private static escapeCsvValue(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /**
     * Exports wallet data to CSV format
     */
    static exportToCsv(wallets: WalletData[], filePath: string, config: WalletConfig): void {
        try {
            if (wallets.length === 0) {
                console.log('No wallets to export');
                return;
            }

            const headers = this.getHeaders(config);

            const headerRow = headers.join(',') + '\n';

            const rows = wallets.map(wallet => {
                const values = this.getRowValues(wallet, headers);
                return values.map(this.escapeCsvValue).join(',');
            }).join('\n');

            fs.writeFileSync(filePath, headerRow + rows);
            
            console.log(`CSV file successfully exported to: ${filePath}`);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }
}