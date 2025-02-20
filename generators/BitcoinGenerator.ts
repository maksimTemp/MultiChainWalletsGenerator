import { NetworkWalletGenerator } from './BaseGenerator';
import { mnemonicToSeed } from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';

/**
 * Bitcoin Taproot address generator
 */
export class BitcoinGenerator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        bitcoin.initEccLib(ecc);
        const bip32 = BIP32Factory(ecc);
        
        const seed = await mnemonicToSeed(seedPhrase);
        
        const masterKey = bip32.fromSeed(seed);
        const child = masterKey.derivePath("m/86'/0'/0'/0/0");

        const pubKeyBuffer = Buffer.from(child.publicKey.slice(1, 33));

        const { address } = bitcoin.payments.p2tr({
            internalPubkey: pubKeyBuffer,
            network: bitcoin.networks.bitcoin
        });

        return address!;
    }
}
