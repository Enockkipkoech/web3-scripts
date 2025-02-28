import { BigNumberish, ethers, parseEther } from 'ethers';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

export const transferToken = async (
	tokenAddress: string,
	to: string,
	amount: string,
	pk: string
) => {
	try {
		const ERC20ABI = [
			'function transfer(address to, uint amount) returns (bool)',
			'function decimals() view returns (uint8)',
			'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
			'function balanceOf(address owner) view returns (uint256)',
			{
				constant: false,
				inputs: [
					{ internalType: 'address', name: 'spender', type: 'address' },
					{ internalType: 'uint256', name: 'amount', type: 'uint256' },
				],
				name: 'approve',
				outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
		];

		const rpc = 'https://bsc-dataseed.bnbchain.org';
		const provider = new ethers.JsonRpcProvider(rpc);

		const signer = new ethers.Wallet(pk, provider);
		const contract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
		const overloads = {
			gasPrice: parseEther('0.000000001'),
			gasLimit: 100000,
		};

		const amountInUnits = ethers.parseUnits(amount, 18);
		const tx = await contract.transfer(to, amountInUnits, overloads);
		console.log(`Pending transfer: ${JSON.stringify(tx)}`);
		const txReceipt = await tx.wait();

		if (txReceipt.status === 1) {
			console.log(
				`\n🚀 Transfer Successful: ${amount} tokens transferred. \n RECEIPT: ${JSON.stringify(
					txReceipt
				)}`
			);
			return txReceipt.transactionHash;
		}

		console.error('❌ Error transferring tokens:', txReceipt);
	} catch (error) {
		console.error('❌ Error transferring tokens:', error);
		return null;
	}
};

export const transferEth = async (to: string, amount: string, pk: string) => {
	try {
		const rpc = 'https://bsc-dataseed.bnbchain.org';
		const provider = new ethers.JsonRpcProvider(rpc);

		const signer = new ethers.Wallet(pk, provider);
		const overloads = {
			gasPrice: parseEther('0.000000001'),
			gasLimit: 100000,
		};

		const tx = await signer.sendTransaction({
			to,
			value: Number((Number(amount) * 0.9).toFixed(6)),
			...overloads,
		});
		console.log(`Pending transfer: ${JSON.stringify(tx)}`);
		const txReceipt = await tx.wait();

		if (txReceipt?.status === 1) {
			console.log(
				`\n🚀 Transfer Successful: ${amount} BNB transferred. \n RECEIPT: ${JSON.stringify(
					txReceipt
				)}`
			);
			return txReceipt;
		}

		console.error('❌ Error transferring BNB:', txReceipt);
	} catch (error) {
		console.error('❌ Error transferring BNB:', error);
		return null;
	}
};
