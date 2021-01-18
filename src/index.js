import 'regenerator-runtime/runtime';

import {
  broadcastTx,
  createAccount,
  accountDetails,
  initContract,
  login,
  logout,
} from './utils';

import getConfig from './config';
const { networkId } = getConfig(process.env.NODE_ENV || 'development');

// global variable used throughout
let currentGreeting;

const submitButton = document.querySelector('form button');

document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault();

  // get elements from the form using their id attribute
  const { fieldset, greeting } = event.target.elements;

  // disable the form while the value gets updated on-chain
  fieldset.disabled = true;

  try {
    // make an update call to the smart contract
    const resp = await window.contract.setGreeting({
      // pass the value that the user entered in the greeting field
      message: greeting.value,
    });
  } catch (e) {
    alert(
      'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
    );
    throw e;
  } finally {
    // re-enable the form, whether the call succeeded or failed
    fieldset.disabled = false;
  }

  // disable the save button, since it now matches the persisted value
  submitButton.disabled = true;

  // update the greeting in the UI
  await fetchGreeting();

  // show notification
  document.querySelector('[data-behavior=notification]').style.display =
    'block';

  // remove notification again after css animation completes
  // this allows it to be shown again next time the form is submitted
  setTimeout(() => {
    document.querySelector('[data-behavior=notification]').style.display =
      'none';
  }, 11000);
};

document.querySelector('input#greeting').oninput = (event) => {
  if (event.target.value !== currentGreeting) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
};

document.querySelector('#sign-in-button').onclick = login;
document.querySelector('#sign-out-button').onclick = logout;

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block';
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  broadcastTx();

  createAccount();

  accountDetails();

  document.querySelector('#signed-in-flow').style.display = 'block';

  document.querySelectorAll('[data-behavior=account-id]').forEach((el) => {
    el.innerText = window.accountId;
  });

  // populate links in the notification box
  const accountLink = document.querySelector(
    '[data-behavior=notification] a:nth-of-type(1)'
  );
  accountLink.href = accountLink.href + window.accountId;
  accountLink.innerText = '@' + window.accountId;
  const contractLink = document.querySelector(
    '[data-behavior=notification] a:nth-of-type(2)'
  );
  contractLink.href = contractLink.href + window.contract.contractId;
  contractLink.innerText = '@' + window.contract.contractId;

  // update with selected networkId
  accountLink.href = accountLink.href.replace('testnet', networkId);
  contractLink.href = contractLink.href.replace('testnet', networkId);

  // fetchGreeting();
}

// update global currentGreeting variable; update DOM with it
async function fetchGreeting() {
  const messages = await contract.getGreeting();
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow();
    else signedOutFlow();
  })
  .catch(console.error);

// const res = await broadcastTx();

// const [
//   balance,

//   storageUsage,

//   contractName,
//   blockTimestamp,
//   blockIndex,

//   accountLockedBalance,
//   epochHeight,
// ] = await Promise.all([
// contract.getBalance(),
// // contract.getUsedGas(),
// contract.getStorageUsage(),
// // contract.getSenderPublicKey(),
// // contract.getSender(),
// // contract.getPrepaidGas(),
// // contract.getPredecessor(),
// contract.getContractName(),
// contract.getBlockTimestamp(),
// contract.getBlockIndex(),
// // contract.getAttachedDeposit(),
// contract.getAccountLockedBalance(),
// contract.getEpochHeight(),
// ]);

// console.log(contract);

// console.log('Balance', balance);
// // console.log('usedGas', usedGas);
// console.log('storageUsage', storageUsage);
// // console.log('senderPublicKey', senderPublicKey);
// // console.log('sender', sender);
// // console.log('prepaidGas', prepaidGas);
// // console.log('predecessor', predecessor);
// console.log('contractName', contractName);
// console.log('blockTimestamp', blockTimestamp);
// console.log('blockIndex', blockIndex);
// // console.log('attachedDeposit', attachedDeposit);
// console.log('accountLockedBalance', accountLockedBalance);
// console.log('epochHeight', epochHeight);
