export interface IWalletAddresses {
    bitcoin?: string;
    ethereum?: string;
    solana?: string;
    tron?: string;
    tonV4R2?: string;
    tonV5R1?: string;
    cosmos?: string;
    sui?: string;
}

export interface WalletConfig {
    generateOnlySeedPhrase: boolean;
    numberOfWallets: number;
    inputFilePath?: string;
    outputPaths: {
        csv: string;
        json: string;
    };
    networks: {
        bitcoin: boolean;
        ethereum: boolean;
        solana: boolean;
        tron: boolean;
        tonV4R2: boolean;
        tonV5R1: boolean;
        cosmos: boolean;
        sui: boolean;
    };
}

export interface ConfigFile {
    GenerateOnlySeedPhrase: boolean;
    InputFilePath: string;
    NumberOfWalletsToGenerate: number;
    OutputCsvPath: string;
    OutputJsonPath: string;
    GenerateBitcoinTaproot: boolean;
    GenerateEthereum: boolean;
    GenerateSolana: boolean;
    GenerateTron: boolean;
    GenerateTonV4R2: boolean;
    GenerateTonV5R1: boolean;
    GenerateCosmos: boolean;
    GenerateSui: boolean;
}