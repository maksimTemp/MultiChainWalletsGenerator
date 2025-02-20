import fs from 'fs';
import path from 'path';
import { ConfigFile, WalletConfig } from '../types/interfaces';

export class ConfigLoader {
    static readonly DEFAULT_CONFIG_PATH = './_InputFiles/config.json';
    static readonly OUTPUT_DIR = './_OutputFiles';

    static loadConfig(): WalletConfig {
        try {
            if (!fs.existsSync(this.OUTPUT_DIR)) {
                fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
            }

            const configPath = path.resolve(this.DEFAULT_CONFIG_PATH);
            if (!fs.existsSync(configPath)) {
                throw new Error(`Configuration file not found at ${configPath}`);
            }

            const configFile: ConfigFile = JSON.parse(
                fs.readFileSync(configPath, 'utf-8')
            );

            return {
                generateOnlySeedPhrase: configFile.GenerateOnlySeedPhrase,
                numberOfWallets: configFile.NumberOfWalletsToGenerate,
                inputFilePath: configFile.InputFilePath,
                outputPaths: {
                    csv: path.join(this.OUTPUT_DIR, configFile.OutputCsvPath),
                    json: path.join(this.OUTPUT_DIR, configFile.OutputJsonPath)
                },
                networks: {
                    bitcoin: configFile.GenerateBitcoinTaproot,
                    ethereum: configFile.GenerateEthereum,
                    solana: configFile.GenerateSolana,
                    tron: configFile.GenerateTron,
                    tonV4R2: configFile.GenerateTonV4R2,
                    tonV5R1: configFile.GenerateTonV5R1,
                    cosmos: configFile.GenerateCosmos,
                    sui: configFile.GenerateSui
                }
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load configuration: ${error.message}`);
            }
            throw error;
        }
    }
}