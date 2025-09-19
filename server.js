require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

// Connect to Ethereum (using Infura as example)
const provider = new ethers.providers.InfuraProvider('goerli', process.env.INFURA_PROJECT_ID);

// In-memory store for demo purposes (replace with DB for production)
const wallets = [];

/**
 * Route: Create new Ethereum wallet
 */
app.post('/wallet', async (req, res) => {
    try {
        // Generate new wallet
        const wallet = ethers.Wallet.createRandom();

        // Connect wallet to provider
        const walletConnected = wallet.connect(provider);

        // Store wallet info (do NOT store private keys in plaintext in production)
        wallets.push({
            address: wallet.address,
            privateKey: wallet.privateKey
        });

        res.json({
            message: 'Wallet created',
            address: wallet.address
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: Get balance of wallet
 */
app.get('/wallet/:address/balance', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await provider.getBalance(address);
        res.json({
            address,
            balance: ethers.utils.formatEther(balance) + ' ETH'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/wallet/:address/fund', async (req, res) => {
    try {
        const { address } = req.params;
        const { amount } = req.body; // in ETH

        // Use a funded wallet as sender
        const sender = new ethers.Wallet(process.env.FUNDER_PRIVATE_KEY, provider);

        const tx = await sender.sendTransaction({
            to: address,
            value: ethers.utils.parseEther(amount)
        });

        await tx.wait();

        res.json({ message: 'Wallet funded', txHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});