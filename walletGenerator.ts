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
    mnemonicPhrase: string = '';
    tonMnemonicPhrase: string = '';
    bitcoinAddress: string = '';
    ethereumAddress: string = '';
    solanaAddress: string = '';
    tonV5R1Address: string = '';
    tonV4R2Address: string = '';
    tronAddress: string = '';
    nearAddress: string = '';
    cosmosAddress: string = '';
}

export class WalletGenerator {
    private config: WalletConfig;
    private wallets: Wallet[] = [];

    constructor(config: WalletConfig) {
        this.config = config;
    }

    async generateWallets(): Promise<void> {
        for (let i = 0; i < this.config.NumberOfWalletsToGenerate; i++) {
            let wallet = new Wallet();
            await this.populateWallet(wallet);
            this.wallets.push(wallet);
        }
    }

    async populateWallet(wallet: Wallet): Promise<void> {

        try {
            wallet.tonMnemonicPhrase = await this.generateTonMnemonicPhrases();
            wallet.mnemonicPhrase = await this.generateMnemonicPhrases();
        } catch (error) {
            console.error('Error generateMnemonics', error);
            process.exit(1);
        }
        
        if (this.config.GenerateBitcoinTaproot) {
            try {
                wallet.bitcoinAddress = await this.generateBitcoinTaprootAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateBitcoinTaprootAddress', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateEthereum) {
            try {
                wallet.ethereumAddress = await this.generateEthereumAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateEthereumAddress', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateSolana) {
            try {
                wallet.solanaAddress = await this.generateSolanaAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateSolanaAddress', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateTron) {
            try {
                wallet.tronAddress = await this.generateTronAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateTronAddress', error);
                process.exit(1);
            } 
        }
        
        if (this.config.GenerateTonV4R2) {
            try {
                wallet.tonV4R2Address = await this.generateTonV4R2Address(wallet.tonMnemonicPhrase);
            } catch (error) {
                console.error('Error generateTonW4R2Address', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateTonV5R1) {
            try {
                wallet.tonV5R1Address = await this.generateTonV5R1Address(wallet.tonMnemonicPhrase);
            } catch (error) {
                console.error('Error generateTonW5Address', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateNear) {
            try {
                wallet.nearAddress = await this.generateNearAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateNearAddress', error);
                process.exit(1);
            } 
        }

        if (this.config.GenerateCosmos) {
            try {
                wallet.cosmosAddress =  await this.generateCosmosAddress(wallet.mnemonicPhrase);
            } catch (error) {
                console.error('Error generateCosmosAddress', error);
                process.exit(1);
            } 
        }
    }

    async generateMnemonicPhrases(): Promise<string> {
        return generateMnemonic(256);
    }

    async generateTonMnemonicPhrases(): Promise<string> {
        return (await mnemonicNew(24)).join(' ');
    }

    async generateBitcoinTaprootAddress(mnemonic: string): Promise<string> {

        var bip32 = BIP32Factory(ecc);
        bitcoin.initEccLib(ecc);

        var seed = await mnemonicToSeed(mnemonic);

        var root = bip32.fromSeed(seed);

        var path = "m/86'/0'/0'/0/0";
        var child = root.derivePath(path);
        var pubKey = child.publicKey;

        var address = bitcoin.payments.p2tr({
            internalPubkey: pubKey.slice(1, 33),
            network: bitcoin.networks.bitcoin,
        }).address as string;
        return address;
    }

    async generateEthereumAddress(mnemonic: string): Promise<string> {
        const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
        return ethWallet.address;
    }

    async generateSolanaAddress(mnemonic: string): Promise<string> {
        var seed = await mnemonicToSeed(mnemonic);
        const derivationPath = "m/44'/501'/0'/0'";

        const { key } = derivePath(derivationPath, seed.toString('hex'));

        const keyPair = nacl.sign.keyPair.fromSeed(key);

        const publicKey = new PublicKey(keyPair.publicKey);

        var address = publicKey.toBase58();
        return address;
    }

    async generateTronAddress(mnemonic: string): Promise<string> {
        const seed = await mnemonicToSeed(mnemonic);
        const root = HDKey.fromMasterSeed(seed);
        const derived = root.derive("m/44'/195'/0'/0/0"); // Tron BIP44 path
        const tronWeb = new TronWeb.TronWeb({ fullHost: 'https://api.trongrid.io' });
        const address = tronWeb.address.fromPrivateKey(derived.privateKey.toString('hex')).toString() as string;

        return address;
    }

    async generateTonV4R2Address(mnemonic: string): Promise<string> {
        var keyPair =  await mnemonicToWalletKey(mnemonic.split(' '));
        var w4r2Wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
        return w4r2Wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
    }

    async generateTonV5R1Address(mnemonic: string): Promise<string> {
        var keyPair =  await mnemonicToWalletKey(mnemonic.split(' '));
        var w5Wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
        return w5Wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
    }

    async generateNearAddress(mnemonic: string): Promise<string> {
        // var seed = await mnemonicToSeed(mnemonic); 
        // var { key } = derivePath("m/44'/397'/0'/0'", seed.toString('hex')); 

        // var keyPairNacl = nacl.sign.keyPair.fromSeed(key);
        // var secretKeyBase58 = bs58.encode(Buffer.from(keyPairNacl.secretKey.slice(0, 32)));
        // var keyPairString: nearAPI.utils.KeyPairString = `ed25519:${secretKeyBase58}`;
        // var keyPair = nearAPI.KeyPair.fromString(keyPairString);
        // return keyPair.getPublicKey().toString()
        return "under development";
    }

    async generateCosmosAddress(mnemonic: string): Promise<string> {
        var cosmosWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
        var [cosmosAccount] = await cosmosWallet.getAccounts();
        return cosmosAccount.address;
    }

    async getSeedFromMnemonic(mnemonic: string): Promise<Buffer> {
    return mnemonicToSeed(mnemonic);

}

    saveToJson(): void {
        fs.writeFileSync(this.config.OutputJsonPath, JSON.stringify(this.wallets, null, 2));
    }

    saveToCsv(): void {
        var header = Object.keys(this.wallets[0]).join(',') + '\n';
        var rows = this.wallets.map(wallet => Object.values(wallet).join(',') + '\n');
        fs.writeFileSync(this.config.OutputCsvPath, header + rows.join(''));
    }

    async run(): Promise<void> {
        await this.generateWallets();
        this.saveToJson();
        this.saveToCsv();
    }
}


