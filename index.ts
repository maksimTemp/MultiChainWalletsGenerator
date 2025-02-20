import { ConfigLoader } from './utils/ConfigLoader';
import { WalletGenerator } from './WalletGenerator';

async function main() {
    try {
        // Загружаем конфигурацию из файла
        const config = ConfigLoader.loadConfig();
        
        // Создаем и запускаем генератор
        const generator = new WalletGenerator(config);
        await generator.run();
        
        console.log('Wallet generation completed successfully!');
    } catch (error) {
        console.error('Application error:', error);
        process.exit(1);
    }
}

main();