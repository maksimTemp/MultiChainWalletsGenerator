import { WalletGenerator, WalletConfig } from './walletGenerator';
import fs from 'fs';


function loadConfig(path: string): WalletConfig {
    try {
        const rawData = fs.readFileSync(path, 'utf8');
        return JSON.parse(rawData) as WalletConfig;
    } catch (error) {
        console.error('Error loading config file:', error);
        process.exit(1);
    }
}


const config = loadConfig('./config.json');

const generator = new WalletGenerator(config);
generator.run().then(() => {
    console.log('Wallet generation complete');
}).catch(error => {
    console.error('An error occurred:', error);
});