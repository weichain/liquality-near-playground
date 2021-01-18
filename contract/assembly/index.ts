/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */

import { Context, logging, storage, u128 } from 'near-sdk-as';

const DEFAULT_MESSAGE = 'Hello';

// Exported functions will be part of the public interface for your smart contract.
// Feel free to extract behavior to non-exported functions!
export function getGreeting(accountId: string): string | null {
  // This uses raw `storage.get`, a low-level way to interact with on-chain
  // storage for simple contracts.
  // If you have something more complex, check out persistent collections:
  // https://docs.near.org/docs/roles/developer/contracts/assemblyscript#imports

  return storage.get<string>(accountId, DEFAULT_MESSAGE);
}

// export function getBalance(): u128 {
//   return Context.accountBalance;
// }

// export function getEpochHeight(): u64 {
//   return Context.epochHeight as u64;
// }

// export function getAccountLockedBalance(): u128 {
//   return Context.accountLockedBalance;
// }

// export function getAttachedDeposit(): u128 {
//   return Context.attachedDeposit;
// }

// export function getBlockIndex(): u64 {
//   return Context.blockIndex as u64;
// }

// export function getBlockTimestamp(): u64 {
//   return Context.blockTimestamp as u64;
// }

// export function getContractName(): string {
//   return Context.contractName;
// }

// export function getPredecessor(): string {
//   return Context.predecessor;
// }

// export function getPrepaidGas(): u64 {
//   return Context.prepaidGas as u64;
// }

// export function getSender(): string {
//   return Context.sender;
// }

// export function getSenderPublicKey(): string {
//   return Context.senderPublicKey;
// }

// export function getStorageUsage(): u64 {
//   return Context.storageUsage as u64;
// }

// export function getUsedGas(): u64 {
//   return Context.usedGas as u64;
// }

export function setGreeting(message: string): void {
  const account_id = Context.sender;

  // Use logging.log to record logs permanently to the blockchain!
  logging.log(
    // String interpolation (`like ${this}`) is a work in progress:
    // https://github.com/AssemblyScript/assemblyscript/pull/1115
    'Saving greeting "' + message + '" for account "' + account_id + '"'
  );

  storage.set(account_id, message);
}
