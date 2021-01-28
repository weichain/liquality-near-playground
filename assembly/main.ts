import { storage, logging, u256, context, math, ContractPromiseBatch } from "near-sdk-as";
import { Swap } from "./model";

export function init(secretHash: Uint8Array, expiration: u64, buyer: string): void {
  assert(!storage.hasKey("swap"), "ALREADY_INITIALIZED.");
  assert(secretHash.length == 32, "INVALID_SECRET_HASH");
  logging.log("Init at: " + expiration.toString() + " for Buyer: " + buyer);
  storage.set("swap", { secretHash, expiration, buyer, seller: context.sender } as Swap);
}

export function getSwap(): Swap {
  return storage.getSome<Swap>("swap");
}

export function claim(secret: Uint8Array): void {
  const swapInfo = getSwap();
  logging.log("Expiration: " + swapInfo.expiration.toString() + " Block Timestamp: " + context.blockTimestamp.toString());
  assert(u256.fromUint8ArrayLE(math.sha256(secret)) == u256.fromUint8ArrayLE(swapInfo.secretHash), "INVALID_SECRET");
  assert(context.blockTimestamp <= swapInfo.expiration, "SWAP_EXPIRED");
  ContractPromiseBatch.create(context.contractName).delete_account(swapInfo.buyer);
}

export function refund(): void {
  const swapInfo = getSwap();
  logging.log("Expiration: " + swapInfo.expiration.toString() + " Block Timestamp: " + context.blockTimestamp.toString());
  assert(context.blockTimestamp > swapInfo.expiration, "SWAP_NOT_EXPIRED");
  ContractPromiseBatch.create(context.contractName).delete_account(swapInfo.seller);
}
