// Next, React
import { FC, useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { notify } from "../../utils/notifications";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { TokenList } from '../../utils/tokens';
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [amount, setAmount] = useState(1);
  const [receiverAddr, setReceiverAddr] = useState("");
  const [tokenAddr, setTokenAddr] = useState("");


  useEffect(() => {
    if (wallet.publicKey) {
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  const handleSendToken = useCallback(async () => {
    if (!publicKey) {
      notify({ type: 'error', message: `Wallet not connected!` });
      return;
    }

    if (!receiverAddr) {
      notify({ type: 'error', message: `Invalid recepient Address!` });
      return
    }

    let signature: TransactionSignature = '';
    let messageLegacy;
    let instructions = [];

    try {

      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()
      let receiver = new PublicKey(receiverAddr)

      if (tokenAddr === '') {
        // Create instructions to send, in this case a simple transfer
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: receiver,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        )

      } else {
        const splToken = new PublicKey(tokenAddr);
        const mint = await getMint(connection, splToken);

        let payerAta = await getAssociatedTokenAddress(
          mint.address, // token
          wallet.publicKey, // owner
          false
        );

        let receiverAta = await getAssociatedTokenAddress(
          mint.address, // token
          receiver, // owner
          false
        );

        try {
          await getAccount(connection, receiverAta);
        } catch (e) {
          // Create ATA on behalf of receiver
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              receiverAta,
              receiver,
              mint.address
            )
          )
        }

        instructions.push(
          createTransferCheckedInstruction(
            payerAta, // from
            mint.address, // mint
            receiverAta, // to
            wallet.publicKey, // from's owner
            amount * 10 ** mint.decimals, // amount
            mint.decimals // decimals
          )
        )
      }
      // Create a new TransactionMessage with version and compile it to legacy
      messageLegacy = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToLegacyMessage();

      // Create a new VersionedTransacction which supports legacy and v0
      const transation = new VersionedTransaction(messageLegacy)
      // Send transaction and await for signature
      signature = await sendTransaction(transation, connection);
      // Send transaction and await for signature
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');
      notify({ type: 'success', message: 'Transaction successful!', txid: signature });

    } catch (error: any) {
      notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
      console.log('error', `Transaction failed! ${error?.message}`, signature);
      return;
    }
  }, [publicKey, notify, connection, sendTransaction, tokenAddr, amount, receiverAddr]);


  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className=''>
          <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            Send your SPL tokens at ease
          </h1>
        </div>
        <select className="select w-full max-w-xs" onChange={(e) => setTokenAddr(e.target.value)}>
          {TokenList.map((item, key) =>
            <option key={key} value={item.address}>
              {item.symbol}
            </option>
          )}
        </select>
        <label className="form-control w-full max-w-xs">
          <span className="label-text mb-2 ml-2">Token Amount to send</span>
          <input type="number" placeholder="Input amount" className="input  w-full max-w-xs" onChange={(e) => setAmount(Number(e.target.value))} value={amount} />
        </label>
        <label className="form-control w-full max-w-xs">
          <span className="label-text mb-2 ml-2">Recepient Address</span>
          <input type="text" placeholder="ex:D3V8DhfG3nKLL99Ywb6ThuU8DxxbBgnPQmA3piqQ2ec2" className="input  w-full max-w-xs" value={receiverAddr} onChange={(e) => setReceiverAddr(e.target.value)} />
        </label>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row justify-center">
            <div className="relative group items-center">
              <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <button
                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                onClick={handleSendToken} disabled={!publicKey}
              >
                <div className="hidden group-disabled:block ">
                  Wallet not connected
                </div>
                <span className="block group-disabled:hidden" >
                  Send Transaction
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
