import Web3 from 'web3';
import 'dotenv/config';

// WEB3 CONNECTION
const rpcUrl = process.env.RPC_URL;
const web3 = new Web3(rpcUrl);

console.log(`MY CURRENT CHAIN:🔥`, web3.config.defaultChain, `🔥`);
const web3JsProvider = web3.currentProvider;

// PROVIDER
export const getWeb3Provider = async () => {
	const provider = await web3JsProvider;
	return provider;
};
