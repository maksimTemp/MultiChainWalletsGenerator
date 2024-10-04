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

// import * as fs from 'fs';
// import * as path from 'path';

// // Define the interface for the original structure
// interface OriginalData {
//     tonMnemonicPhrase: string;
//     tonV4R2Address: string;
//     tonV5R1Address: string;
// }

// // Define the interface for the modified structure
// interface ModifiedData extends OriginalData {
//     trey_num: string;
//     Tg_nickname: string;
//     Tg_num: string;
// }

// // Function to update the JSON file
// const updateJsonFile = (filePath: string): void => {
//     try {
//         // Read the JSON file
//         const data = fs.readFileSync(filePath, 'utf8');
//         const jsonArray: OriginalData[] = JSON.parse(data);

//         // Modify the data
//         const updatedArray: ModifiedData[] = jsonArray.map(item => ({
//             trey_num: "",
//             Tg_nickname: "",
//             Tg_num: "",
//             tonMnemonicPhrase: item.tonMnemonicPhrase,
//             tonV4R2Address: item.tonV4R2Address,
//             tonV5R1Address: item.tonV5R1Address
//         }));

//         // Write the updated data back to the file
//         fs.writeFileSync(filePath, JSON.stringify(updatedArray, null, 2), 'utf8');
//         console.log('File updated successfully!');
//     } catch (error) {
//         console.error('Error reading or updating the file:', error);
//     }
// };

// // Example usage
// const filePath = 'D:/_mylittleFARM/_TgFarm/_differentconfigs/test.json';
// updateJsonFile(filePath);