import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

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
        
        // Get all token accounts for the wallet (legacy SPL + Token-2022)
        const [legacyTokens, token2022Tokens] = await Promise.all([
          connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
          connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID }),
        ]);

        const allAccounts = [...legacyTokens.value, ...token2022Tokens.value];

        console.log('Legacy SPL token accounts:', legacyTokens.value.length);
        console.log('Token-2022 accounts:', token2022Tokens.value.length);
        console.log('Total token accounts found:', allAccounts.length);
        
        // Log all token mints for debugging
        allAccounts.forEach((account, index) => {
          const info = account.account.data.parsed.info;
          const mint = info.mint;
          const uiAmount = info.tokenAmount.uiAmount;
          const raw = info.tokenAmount.amount;
          const decimals = info.tokenAmount.decimals;
          console.log(`Token ${index + 1}: Mint=${mint}, uiAmount=${uiAmount}, raw=${raw}, decimals=${decimals}`);
        });

        // Find JIET token account
        const jietAccount = allAccounts.find(
          (account) => account.account.data.parsed.info.mint === JIET_TOKEN_MINT
        );

        if (jietAccount) {
          const tokenAmount = jietAccount.account.data.parsed.info.tokenAmount;
          const amountUi = tokenAmount.uiAmount ?? Number(tokenAmount.amount) / 10 ** tokenAmount.decimals;
          console.log('JIET token account found! Balance:', amountUi);
          setBalance(amountUi || 0);
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
