// этот блокчейн помойка что касается самого блокчейна , что их репозиториев и документаций.
// будет пример старых рабочих функций. которые невозможно употребить в мультичейн кошельке
import { NetworkWalletGenerator } from './BaseGenerator';
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import { mnemonicToWalletKey} from "@ton/crypto";
import 'tonweb';
/**
 * TON V4R2 address generator
 */
export class TonV4Generator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        const keyPair = await mnemonicToWalletKey(seedPhrase.split(' '));
        const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
        return wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
    }
}

/**
 * TON V5R1 address generator
 */
export class TonV5Generator extends NetworkWalletGenerator {
    async generateAddress(seedPhrase: string): Promise<string> {
        const keyPair = await mnemonicToWalletKey(seedPhrase.split(' '));
        const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
        return wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
    }
}
