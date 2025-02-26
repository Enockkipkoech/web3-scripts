import Web3 from 'web3';
import dotenv from 'dotenv';
dotenv.config();

const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'; // BSC Mainnet RPC
const web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));

console.log(`🔌 Connected to BSC RPC: ${JSON.stringify(web3.provider)}`);

// BUSD Contract Address on BSC
const BUSD_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // Mainnet BUSD address
const BUSD_DECIMALS = 18;

// ABI for ERC-20 "transfer" function
const ERC20_ABI = [
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: 'recipient', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
];

/**
 * Transfers BUSD from one address to another
 * @param sender - Sender's wallet address
 * @param recipient - Recipient's wallet address
 * @param amount - Amount in BUSD (not in Wei)
 * @param privateKey - Private key of sender (NEVER expose this in frontend)
 */
export const transferBUSD = async (
	sender: string,
	amount: number,
	privateKey: string
) => {
	try {
		const recipient = process.env.WALLET_ADDRESS;
		const contract = new web3.eth.Contract(ERC20_ABI, BUSD_CONTRACT_ADDRESS);
		const amountToSend = web3.utils.toBigInt(amount * 10 ** BUSD_DECIMALS); // Convert to smallest unit

		// Build transaction
		const txData = contract.methods
			.transfer(recipient, amountToSend)
			.encodeABI();
		const nonce = await web3.eth.getTransactionCount(sender);
		const gasPrice = await web3.eth.getGasPrice();
		console.log(`🔥 Nonce: ${nonce}, Gas Price: ${gasPrice}}`);
		console.log(`🔥 Sending ${amount} BUSD from ${sender} to ${recipient}`);

		const overloads = {
			gasLimit: 50000,
			gas: '21000',
			data: txData,
		};

		const txParams = {
			from: sender,
			to: BUSD_CONTRACT_ADDRESS,
			value: amountToSend.toString(),
			gasPrice,
			nonce,
			type: '0x0',
			overloads,
		};
		console.log(`🔥 Transaction Params:, txParams`);

		// Sign and send transaction
		const signedTx = await web3.eth.accounts.signTransaction(
			txParams,
			privateKey
		);
		console.log(`🔥 Signed Transaction:, signedTx`);
		const receipt = await web3.eth
			.sendSignedTransaction(signedTx.rawTransaction)
			.then((tx) => {
				console.log('Transaction sent', tx);
				return tx;
			});
		console.log(
			`✅ BUSD Transfer Successful! Tx Hash: ${receipt.transactionHash}`
		);
		return receipt;
	} catch (error) {
		console.error('❌ Error transferring BUSD:', error);
		return null;
	}
};

/**
 * Transfers BNB from one address to another
 * @param sender - Sender's wallet address
 * @param recipient - Recipient's wallet address
 * @param amount - Amount in BNB
 * @param privateKey - Private key of sender
 */
export const transferBNB = async (
	sender: string,
	recipient: string,
	amount: number,
	privateKey: string
) => {
	try {
		const nonce = await web3.eth.getTransactionCount(sender, 'pending');
		const gasPrice = await web3.eth.getGasPrice();
		const amountToSend = web3.utils.toWei(amount.toString(), 'ether');

		// Build transaction
		const txParams = {
			from: sender,
			to: recipient,
			value: amountToSend,
			gas: 21000, // Standard gas limit for BNB transfers
			gasPrice,
			nonce,
		};

		// Sign and send transaction
		const signedTx = await web3.eth.accounts.signTransaction(
			txParams,
			privateKey
		);
		const receipt = await web3.eth.sendSignedTransaction(
			signedTx.rawTransaction!
		);
		console.log(
			`✅ BNB Transfer Successful! Tx Hash: ${receipt.transactionHash}`
		);
		return receipt;
	} catch (error) {
		console.error('❌ Error transferring BNB:', error);
		return null;
	}
};
