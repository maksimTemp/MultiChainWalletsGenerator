import fs from 'fs';
import {generateMnemonic, mnemonicToSeed}  from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { Keypair, PublicKey } from '@solana/web3.js';
import TronWeb from 'tronweb';
import * as nearAPI from 'near-api-js';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { WalletContractV5R1, WalletContractV4 } from "@ton/ton";
import { mnemonicNew, mnemonicToWalletKey } from "@ton/crypto";
import HDKey from 'hdkey';
import BIP32Factory from 'bip32';
import nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import { KeyPairString } from 'near-api-js/lib/utils';
import { ethers} from 'ethers';
import bs58 from 'bs58';
import * as ecc from 'tiny-secp256k1';

export interface WalletConfig {
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
    GenerateNear: boolean;
    GenerateCosmos: boolean;
}

class Wallet {
    mnemonicPhrase?: string;
    tonMnemonicPhrase?: string;
    bitcoinAddress?: string;
    ethereumAddress?: string;
    solanaAddress?: string;
    tonV5R1Address?: string;
    tonV4R2Address?: string;
    tronAddress?: string;
    nearAddress?: string;
    cosmosAddress?: string;
}

export class WalletGenerator {
    private config: WalletConfig;
    private wallets: Wallet[] = [];
    private tasks: ((wallet: Wallet) => Promise<void>)[] = [];

    constructor(config: WalletConfig) {
        this.config = config;
        this.buildTaskQueue();
    }

    private buildTaskQueue(): void {
        if (this.config.GenerateOnlySeedPhrase) {
            this.tasks.push((wallet: Wallet) => this.generateMnemonicPhrases(wallet));
            return;
        } else {
            if(
                this.config.GenerateBitcoinTaproot || 
                this.config.GenerateEthereum ||
                this.config.GenerateSolana ||
                this.config.GenerateTron ||
                this.config.GenerateCosmos ||
                this.config.GenerateNear
            )
            {
                this.tasks.push((wallet: Wallet) => this.generateMnemonicPhrases(wallet));
            }

            if (this.config.GenerateTonV4R2 || this.config.GenerateTonV5R1) {
                this.tasks.push((wallet: Wallet) => this.generateTonMnemonicPhrases(wallet));
            }

            const networkTasks = [
                { condition: this.config.GenerateBitcoinTaproot, task: this.generateBitcoinTaprootAddress },
                { condition: this.config.GenerateEthereum, task: this.generateEthereumAddress },
                { condition: this.config.GenerateSolana, task: this.generateSolanaAddress },
                { condition: this.config.GenerateTron, task: this.generateTronAddress },
                { condition: this.config.GenerateTonV4R2, task: this.generateTonV4R2Address },
                { condition: this.config.GenerateTonV5R1, task: this.generateTonV5R1Address },
                { condition: this.config.GenerateNear, task: this.generateNearAddress },
                { condition: this.config.GenerateCosmos, task: this.generateCosmosAddress },
            ];

            for (const { condition, task } of networkTasks) {
                if (condition) {
                    this.tasks.push(task.bind(this));
                }
            }

        }
    }
    async generateWallets(): Promise<void> {
        for (let i = 0; i < this.config.NumberOfWalletsToGenerate; i++) {
            let wallet = new Wallet();

            for (let task of this.tasks) {
                try {
                    await task(wallet);
                } catch (error) {
                    console.error(`Error during task execution for wallet ${i}:`, error);
                }
            }

            this.wallets.push(wallet);
        }
    }

    async generateMnemonicPhrases(wallet: Wallet): Promise<void> {
        try {
            wallet.mnemonicPhrase = await generateMnemonic(256);
        } catch (error) {
            console.error('Error generating mnemonic phrase:', error);
        }
    }

    async generateTonMnemonicPhrases(wallet: Wallet): Promise<void> {
        try {
            wallet.tonMnemonicPhrase = (await mnemonicNew(24)).join(' ');
        } catch (error) {
            console.error('Error generating TON mnemonic phrase:', error);
        }
    }

    async generateBitcoinTaprootAddress(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.mnemonicPhrase) return;  
            const bip32 = BIP32Factory(ecc);
            bitcoin.initEccLib(ecc);
            const seed = await mnemonicToSeed(wallet.mnemonicPhrase);
            const root = bip32.fromSeed(seed);
            const path = "m/86'/0'/0'/0/0";
            const child = root.derivePath(path);
            const pubKey = child.publicKey;
            wallet.bitcoinAddress = bitcoin.payments.p2tr({
                internalPubkey: pubKey.slice(1, 33),
                network: bitcoin.networks.bitcoin,
            }).address as string;
        } catch (error) {
            console.error('Error generating Bitcoin Taproot address:', error);
        }
    }

    async generateEthereumAddress(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.mnemonicPhrase) return;
            const ethWallet = ethers.Wallet.fromPhrase(wallet.mnemonicPhrase);
            wallet.ethereumAddress = ethWallet.address;
        } catch (error) {
            console.error('Error generating Ethereum address:', error);
        }
    }

    async generateSolanaAddress(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.mnemonicPhrase) return;
            const seed = await mnemonicToSeed(wallet.mnemonicPhrase);
            const { key } = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
            const keyPair = nacl.sign.keyPair.fromSeed(key);
            const publicKey = new PublicKey(keyPair.publicKey);
            wallet.solanaAddress = publicKey.toBase58();
        } catch (error) {
            console.error('Error generating Solana address:', error);
        }
    }

    async generateTronAddress(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.mnemonicPhrase) return;
            const seed = await mnemonicToSeed(wallet.mnemonicPhrase);
            const root = HDKey.fromMasterSeed(seed);
            const derived = root.derive("m/44'/195'/0'/0/0");
            const tronWeb = new TronWeb.TronWeb({ fullHost: 'https://api.trongrid.io' });
            wallet.tronAddress = tronWeb.address.fromPrivateKey(derived.privateKey.toString('hex')).toString();
        } catch (error) {
            console.error('Error generating TRON address:', error);
        }
    }

    async generateTonV4R2Address(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.tonMnemonicPhrase) return;
            const keyPair = await mnemonicToWalletKey(wallet.tonMnemonicPhrase.split(' '));
            const w4r2Wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
            wallet.tonV4R2Address = w4r2Wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
        } catch (error) {
            console.error('Error generating TON V4R2 address:', error);
        }
    }

    async generateTonV5R1Address(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.tonMnemonicPhrase) return;
            const keyPair = await mnemonicToWalletKey(wallet.tonMnemonicPhrase.split(' '));
            const w5Wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
            wallet.tonV5R1Address = w5Wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
        } catch (error) {
            console.error('Error generating TON V5R1 address:', error);
        }
    }

    async generateNearAddress(wallet: Wallet): Promise<void> {
        try {
            // var seed = await mnemonicToSeed(mnemonic); 
        // var { key } = derivePath("m/44'/397'/0'/0'", seed.toString('hex')); 

        // var keyPairNacl = nacl.sign.keyPair.fromSeed(key);
        // var secretKeyBase58 = bs58.encode(Buffer.from(keyPairNacl.secretKey.slice(0, 32)));
        // var keyPairString: nearAPI.utils.KeyPairString = `ed25519:${secretKeyBase58}`;
        // var keyPair = nearAPI.KeyPair.fromString(keyPairString);
        // return keyPair.getPublicKey().toString()
        wallet.nearAddress = "under development";
        } catch (error) {
            console.error('Error generating NEAR address:', error);
        }
    }

    async generateCosmosAddress(wallet: Wallet): Promise<void> {
        try {
            if (!wallet.mnemonicPhrase) return;
            const cosmosWallet = await DirectSecp256k1HdWallet.fromMnemonic(wallet.mnemonicPhrase);
            const [cosmosAccount] = await cosmosWallet.getAccounts();
            wallet.cosmosAddress = cosmosAccount.address;
        } catch (error) {
            console.error('Error generating Cosmos address:', error);
        }
    }

    private saveToJson(): void {
        try {
            if (this.wallets.length === 0) return;
            let output: any[];

            if (this.config.GenerateOnlySeedPhrase) {
                output = this.wallets.map(wallet => ({ mnemonicPhrase: wallet.mnemonicPhrase }));
            } else {
                output = this.wallets.map(wallet => {
                    const filteredWallet: Wallet = {};
                    for (const [key, value] of Object.entries(wallet)) {
                        if (value !== undefined) {
                            filteredWallet[key as keyof Wallet] = value;
                        }
                    }
                    return filteredWallet;
                });
            }

            fs.writeFileSync(this.config.OutputJsonPath, JSON.stringify(output, null, 2));
        } catch (error) {
            console.error('Error saving to JSON file:', error);
        }
    }

    private saveToCsv(): void {
        try {
            if (this.wallets.length === 0) return;
            const keys = Object.keys(this.wallets[0]).filter(key => this.wallets[0][key as keyof Wallet] !== undefined);
            const header = keys.join(',') + '\n';
            const rows = this.wallets.map(wallet => 
                keys.map(key => wallet[key as keyof Wallet] || '').join(',') + '\n'
            );
            fs.writeFileSync(this.config.OutputCsvPath, header + rows.join(''));
        } catch (error) {
            console.error('Error saving to CSV file:', error);
        }
    }

    async run(): Promise<void> {
        try {
            await this.generateWallets();
            this.saveToJson();
            this.saveToCsv();
        } catch (error) {
            console.error('Error running wallet generation:', error);
        }
    }
}


