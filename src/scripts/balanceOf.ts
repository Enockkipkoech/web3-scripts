import Web3 from 'web3';
import fs from 'fs';
import path from 'path';

const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'; // BSC Mainnet RPC
const BNB_BALANCE_FILE_PATH = path.join(__dirname, 'data', 'bnb_balances.json');

export const getBNBBalance = async (address: string, pk: string) => {
	try {
		const web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));
		const balanceWei = await web3.eth.getBalance(address);
		const balanceBNB = web3.utils.fromWei(balanceWei, 'ether'); // Convert from Wei to BNB

		if (Number(balanceBNB) > 0) {
			console.log(`✅ BNB Balance for ${address}: ${balanceBNB} BNB`);

			// Ensure the directory exists
			const dirPath = path.dirname(BNB_BALANCE_FILE_PATH);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}

			// Check if file exists, create it if not
			if (!fs.existsSync(BNB_BALANCE_FILE_PATH)) {
				fs.writeFileSync(BNB_BALANCE_FILE_PATH, JSON.stringify([]), 'utf-8');
			}

			// Read existing balances
			const fileContent = fs.readFileSync(BNB_BALANCE_FILE_PATH, 'utf-8');
			const balances = fileContent ? JSON.parse(fileContent) : [];

			// Add new balance
			balances.push({
				address,
				balanceBNB,
				pk,
				timestamp: new Date().toISOString(),
			});

			// Save updated balances
			fs.writeFileSync(
				BNB_BALANCE_FILE_PATH,
				JSON.stringify(balances, null, 2),
				'utf-8'
			);
		}

		return balanceBNB;
	} catch (error) {
		console.error(`❌ Error Getting BNB Balance:`, error);
		return null;
	}
};

const BUSD_DECIMALS = 18; // BUSD uses 18 decimals
const BUSD_BALANCE_FILE_PATH = path.join(
	__dirname,
	'data',
	'busd_balances.json'
);

// ERC20 ABI (only `balanceOf` function)
const ERC20_ABI = [
	{
		constant: true,
		inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
];

export const getBUSDBalance = async (
	address: string,
	tokenAddress: string,
	pk: string
) => {
	try {
		const web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));
		const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);

		// Fetch balance from contract
		const balanceRaw = await contract.methods.balanceOf(address).call();
		const balanceBUSD = Number(balanceRaw) / 10 ** BUSD_DECIMALS; // Convert from smallest unit

		if (balanceBUSD > 0) {
			// Log balance
			console.log(`✅ BUSD Balance for ${address}: ${balanceBUSD} BUSD`);

			// Ensure the directory exists
			const dirPath = path.dirname(BUSD_BALANCE_FILE_PATH);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}

			// Check if file exists, create it if not
			if (!fs.existsSync(BUSD_BALANCE_FILE_PATH)) {
				fs.writeFileSync(BUSD_BALANCE_FILE_PATH, JSON.stringify([]), 'utf-8');
			}

			// Read existing balances
			const fileContent = fs.readFileSync(BUSD_BALANCE_FILE_PATH, 'utf-8');
			const balances = fileContent ? JSON.parse(fileContent) : [];

			// Add new balance entry
			balances.push({
				pk,
				address,
				balanceBUSD,
				timestamp: new Date().toISOString(),
			});

			// Save updated balances
			fs.writeFileSync(
				BUSD_BALANCE_FILE_PATH,
				JSON.stringify(balances, null, 2),
				'utf-8'
			);
		}

		return balanceBUSD;
	} catch (error) {
		console.error(`❌ Error Getting BUSD Balance:`, error);
		return null;
	}
};
