const { ethers } = require('ethers');
const WalletModel = require('../models/wallet');

const provider = new ethers.InfuraProvider(
  process.env.NETWORK, 
  process.env.INFURA_PROJECT_ID
);

const funder = new ethers.Wallet(
    process.env.FUNDER_PRIVATE_KEY, 
    provider
);
const FUND_AMOUNT = process.env.FUND_AMOUNT || '0.01';

exports.createWallet = async (req, res) => {
    try {
        const wallet = ethers.Wallet.createRandom();
        const walletConnected = wallet.connect(provider);

        // Store encrypted private key
        const newWallet = await WalletModel.create({
            address: wallet.address,
            privateKey: wallet.privateKey,
            funded: false
        });

        // Fund wallet automatically
        const tx = await funder.sendTransaction({
            to: wallet.address,
            value: ethers.utils.parseEther(FUND_AMOUNT)
        });
        await tx.wait();

        newWallet.funded = true;
        await newWallet.save();

        res.json({
            message: 'Wallet created and funded',
            address: wallet.address,
            txHash: tx.hash
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBalance = async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await provider.getBalance(address);
        res.json({ address, balance: ethers.utils.formatEther(balance) + ' ETH' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendETH = async (req, res) => {
    try {
        const { fromAddress, toAddress, amount } = req.body;
        if (!fromAddress || !toAddress || !amount) {
            return res.status(400).json({ error: 'fromAddress, toAddress, and amount are required' });
        }

        const walletDoc = await WalletModel.findOne({ address: fromAddress });
        if (!walletDoc) return res.status(404).json({ error: 'Wallet not found' });

        // Decrypt private key in memory
        const decryptedKey = walletDoc.getPrivateKey();
        const wallet = new ethers.Wallet(decryptedKey, provider);

        // Send transaction
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();

        res.json({ message: 'Transaction successful', txHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
