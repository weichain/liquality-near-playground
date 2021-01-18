import {
  connect,
  Contract,
  keyStores,
  WalletConnection,
  transactions,
  providers,
  utils,
  accountCreator,
  WalletAccount,
} from 'near-api-js';
import { sha256 } from 'js-sha256';
import getConfig from './config';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  window.near = near;

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.

      viewMethods: ['getGreeting'],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ['setGreeting'],
    }
  );
}

export async function accountDetails() {
  const account = await window.near.account(window.accountId);

  // const state = await account.getAccountBalance();

  let state = await window.near.connection.provider.query(
    `transactions/CRAuMWN2bXe3opzJrbscjS2gMM6wPRAFautssNjaLu8b`,
    ''
  );

  console.log(state);
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function createAccount() {
  console.log(window.near);
  window.wallet = new WalletAccount(window.near);
  console.log(window.near);
  console.log(window.wallet);
  console.log(window.wallet.isSignedIn());
  console.log(wallet.getAccountId());
}

export async function broadcastTx() {
  try {
    const sender = 'mitevandon94.testnet';
    const receiver = 'mitevandon942.testnet';
    const networkId = 'testnet';

    const amount = utils.format.parseNearAmount('0.000001');

    const provider = new providers.JsonRpcProvider(
      `https://rpc.${networkId}.near.org`
    );

    // const privateKey = localStorage.getItem(
    //   'near-api-js:keystore:mitevandon94.testnet:testnet'
    // );
    const keyPair = utils.key_pair.KeyPairEd25519.fromString(
      'ed25519:4eU1eB5iTpvWdGevDR3RR43WkQGAgosbZmYuSVutmpfBEvggtE42yb5pZvRiifDbYWxDEuAALp4T9nqiYjXpyUrH'
    );
    const publicKey = keyPair.getPublicKey();

    console.log(keyPair);

    const accessKey = await provider.query(
      `access_key/${sender}/${publicKey.toString()}`,
      ''
    );

    const nonce = ++accessKey.nonce;

    const actions = [transactions.transfer(amount)];

    const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

    const transaction = transactions.createTransaction(
      sender,
      publicKey,
      receiver,
      nonce,
      actions,
      recentBlockHash
    );

    const serializedTx = utils.serialize.serialize(
      transactions.SCHEMA,
      transaction
    );

    const serializedTxHash = new Uint8Array(sha256.array(serializedTx));

    const signature = keyPair.sign(serializedTxHash);

    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature.signature,
      }),
    });

    const signedSerializedTx = signedTransaction.encode();

    const result = await provider.sendJsonRpc('broadcast_tx_commit', [
      Buffer.from(signedSerializedTx).toString('base64'),
    ]);

    console.log(
      `https://explorer.${networkId}.near.org/transactions/${result.transaction.hash}`
    );
  } catch (error) {
    console.log(error);
  }
}

// 'getBalance',
// 'getUsedGas',
// 'getStorageUsage',
// 'getSenderPublicKey',
// 'getSender',
// 'getPrepaidGas',
// 'getPredecessor',
// 'getContractName',
// 'getBlockTimestamp',
// 'getBlockIndex',
// 'getAttachedDeposit',
// 'getAccountLockedBalance',
// 'getEpochHeight',
