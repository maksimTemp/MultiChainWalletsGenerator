## MultiChainWalletsGenerator:

### Overview

The **MultiChainWalletsGenerator** project is a tool designed to generate seed phrases and corresponding wallet addresses for different blockchain networks. This tool is highly customizable, allowing you to generate wallet addresses across various networks using a simple configuration file.

### Features

- **Seed Phrase Generation**: Automatically generates seed phrases for new wallets.
- **Wallet Address Generation**: Generates wallet addresses for various blockchain networks.
- **Multi-Chain Support**: Currently supports the following blockchain networks:
  - Bitcoin Taproot
  - Ethereum
  - Solana
  - Tron
  - TON (The Open Network)
  - Near (under development)
  - Cosmos

- **Flexible Output**: The generated wallets and addresses can be exported to CSV and JSON formats.

### Configuration

The generation process is controlled via a configuration file, allowing users to specify the number of wallets to generate and select which blockchain networks to generate wallet addresses for. The configuration file uses JSON format and looks like this:

```json
{
  "GenerateOnlySeedPhrase": false,
  "InputFilePath": "", (under development, Leave empty)
  "NumberOfWalletsToGenerate": 10,
  "OutputCsvPath": "output.csv",
  "OutputJsonPath": "output.json",
  "GenerateBitcoinTaproot": false,
  "GenerateEthereum": false,
  "GenerateSolana": false,
  "GenerateTron": false,
  "GenerateTonV4R2": true,
  "GenerateTonV5R1": true,
  "GenerateNear": false,
  "GenerateCosmos": false
}
```

### Configuration Parameters

- **GenerateOnlySeedPhrase**: 
  - `true`: Only generates seed phrases without generating wallet addresses.
  - `false`: Generates both seed phrases and corresponding wallet addresses.
  
- **InputFilePath** (under development, Leave empty):  
  - Path to an input file with predefined seed phrases. Leave empty to generate new seed phrases.

- **NumberOfWalletsToGenerate**: 
  - Specifies the number of wallets to generate. If an input file is provided, this value is ignored.

- **OutputCsvPath**: 
  - File path to save the generated wallets in CSV format. If not needed, this field can be left empty.

- **OutputJsonPath**: 
  - File path to save the generated wallets in JSON format.

- **GenerateBitcoinTaproot**: 
  - `true`: Generates Bitcoin Taproot wallet address addresses.
  - `false`: Skips Bitcoin Taproot wallet address generation.

- **GenerateEthereum**: 
  - `true`: Generates Ethereum wallet address addresses.
  - `false`: Skips Ethereum wallet address generation.

- **GenerateSolana**: 
  - `true`: Generates Solana wallet address addresses.
  - `false`: Skips Solana wallet address generation.

- **GenerateTron**: 
  - `true`: Generates Tron wallet address addresses.
  - `false`: Skips Tron wallet address generation.

- **GenerateTonV4R2**: 
  - `true`: Generates wallet addresses for TON (The Open Network) V4R2.
  - `false`: Skips this network's wallet address generation.

- **GenerateTonV5R1**: 
  - `true`: Generates wallet addresses for TON V5R1.
  - `false`: Skips this network's wallet address generation.

- **GenerateNear**: 
  - `true`: Generates Near wallet addresses.
  - `false`: Skips Near wallet address generation.

- **GenerateCosmos**: 
  - `true`: Generates Cosmos wallet address addresses.
  - `false`: Skips Cosmos wallet address generation.

### Usage

1. **Configure Settings**: Modify the JSON configuration file to specify the desired wallet generation options.
  
2. **Run the Generator**: Execute the wallet generator script, and it will generate the wallets based on the configuration provided.

3. **Output**: The generated wallet addresses and seed phrases will be saved to the specified CSV or JSON file paths.

### Example

Here's an example of a simple configuration that generates 5 TON V4R2 and V5R1 wallets:

```json
{
  "GenerateOnlySeedPhrase": false,
  "InputFilePath": "",
  "NumberOfWalletsToGenerate": 5,
  "OutputCsvPath": "output.csv",
  "OutputJsonPath": "output.json",
  "GenerateBitcoinTaproot": false,
  "GenerateEthereum": false,
  "GenerateSolana": false,
  "GenerateTron": false,
  "GenerateTonV4R2": true,
  "GenerateTonV5R1": true,
  "GenerateNear": false,
  "GenerateCosmos": false
}
```

### Requirements

- Node.js environment
- The `walletGenerator.ts` file for execution

### Running the Project

To run the project, follow these steps:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Modify the configuration file to suit your needs.

3. Run the script:
   ```bash
   npx ts-node index.ts
   ```
