import { NetworkWalletGenerator } from "../generators/BaseGenerator";

export interface NetworkInfo {
    name: string;
    generator: NetworkWalletGenerator;
    requiresSpecialSeed?: boolean;
}

export class NetworkRegistry {
    private static instance: NetworkRegistry;
    private networks: Map<string, NetworkInfo>;

    private constructor() {
        this.networks = new Map();
    }

    public static getInstance(): NetworkRegistry {
        if (!NetworkRegistry.instance) {
            NetworkRegistry.instance = new NetworkRegistry();
        }
        return NetworkRegistry.instance;
    }

    public registerNetwork(key: string, info: NetworkInfo): void {
        this.networks.set(key, info);
    }

    public getNetworks(): Map<string, NetworkInfo> {
        return this.networks;
    }

    public getNetworkKeys(): string[] {
        return Array.from(this.networks.keys());
    }
}