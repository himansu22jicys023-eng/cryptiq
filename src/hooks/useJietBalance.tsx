import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// IMPORTANT: Replace this with your actual JIET token mint address from Solana
// You can find this in your Solana token creation transaction or token registry
const JIET_TOKEN_MINT = 'mntS6ZetAcdw5dLFFtLw3UEX3BZW5RkDPamSpEmpSbP';

export const useJietBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching JIET balance for wallet:', publicKey.toString());
        console.log('JIET Token Mint:', JIET_TOKEN_MINT);
        
        // Get all token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        console.log('Total token accounts found:', tokenAccounts.value.length);
        
        // Log all token mints for debugging
        tokenAccounts.value.forEach((account, index) => {
          const mint = account.account.data.parsed.info.mint;
          const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
          console.log(`Token ${index + 1}: Mint=${mint}, Amount=${amount}`);
        });

        // Find JIET token account
        const jietAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === JIET_TOKEN_MINT
        );

        if (jietAccount) {
          const amount = jietAccount.account.data.parsed.info.tokenAmount.uiAmount;
          console.log('JIET token account found! Balance:', amount);
          setBalance(amount || 0);
        } else {
          console.log('No JIET token account found for this wallet');
          setBalance(0);
        }
      } catch (error) {
        console.error('Error fetching JIET balance:', error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return { balance, loading };
};
