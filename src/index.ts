import fs from 'fs';
import path from 'path';
import { getBNBBalance, getBUSDBalance, transferBUSD } from './scripts';

const main = async () => {
	console.log(`${new Date().toISOString()} 🔥START:🚀 BLOCKCHAIN SCRIPTS 🔥 `);
	console.log(`${'##################'.repeat(5)}`);

	// GET DATA
	console.log(path.join(__dirname, 'scripts/data/busd_balances.json'));
	const walletKeys = fs.readFileSync(
		path.join(__dirname, 'scripts/data/busd_balances.json'),
		'utf-8'
	);

	// console.log(JSON.parse(walletKeys));
	const walletJson = JSON.parse(walletKeys);
	// const walletDetails: any = walletJson.data;

	const busdBalFile = fs.readFileSync(
		path.join(__dirname, 'scripts/data/busd_balances.json'),
		'utf-8'
	);
	const busdWallets = JSON.parse(busdBalFile);
	const walletDetails = busdWallets[0];

	// LOOP THROUGH WALLET DETAILS
	const processDataWithRateLimit = async (
		walletDetails: string | any[],
		batchSize = 10,
		delay = 1000
	) => {
		const apiCall = async (item: any) => {
			try {
				console.log(`🔥 Processing Item: ${item.address}`);

				// const ethBalance = await getBNBBalance(item.address);
				// console.log(`ETH BALANCE: ${ethBalance}`);
				// const busdBalance = await getBUSDBalance(
				// 	item.address,
				// 	'0x55d398326f99059fF775485246999027B3197955',
				// 	item.privateKey
				// );
				// console.log(`BUSD BALANCE: ${busdBalance}`);

				const transfer = await transferBUSD(
					item.address,
					item.balanceBUSD,
					item.pk
				);

				console.log(`TRANSFER: ${transfer}`);
			} catch (error) {
				console.log(`❌ Error Getting Eth Balance:`, error);
			}
		};

		// for (let i = 0; i < walletDetails.length; i += batchSize) {
		// 	const batch = walletDetails.slice(i, i + batchSize); // Get batch of items

		// 	// Process each item in the batch concurrently
		// 	if (Array.isArray(batch)) {
		// 		await Promise.all(batch.map((item) => apiCall(item)));
		// 	}

		// 	console.log(
		// 		`Processed batch ${i / batchSize + 1}/${Math.ceil(
		// 			walletDetails.length / batchSize
		// 		)}`
		// 	);

		// 	if (i + batchSize < walletDetails.length) {
		// 		await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before next batch
		// 	}
		// }

		await apiCall(walletDetails);
		console.log('All items processed successfully!');
	};

	// PROCESS DATA
	await processDataWithRateLimit(walletDetails);
};

// START
main();
