import { init, getSwap, claim, refund } from "../main";
import { base64 } from "near-sdk-as";

const secretHash = base64.decode("qUiQTy8PR5uPgZdpSzAYSw0u0cHNKh7A+4XSmaGSpEc=");
const expiration = (Date.now() + 1000 * 120) * 1000 * 1000;
const buyer = "jenny";
const seller = "bob";

describe("HTLC ", () => {
  it("should init", () => {
    init(secretHash, expiration, buyer);
    const swapInfo = getSwap();
    expect(swapInfo).toStrictEqual({ buyer, expiration, secretHash, seller });
  });

  it("should throw contract already initialized", () => {
    init(secretHash, expiration, buyer);
    expect(() => {
      init(secretHash, expiration, buyer);
    }).toThrow("contract already initialized");
  });

  it("should throw hash must be 32 bytes long", () => {
    expect(() => {
      init(new Uint8Array(2).fill(2), expiration, buyer);
    }).toThrow("hash must be 32 bytes long");
  });

  it("buyer can be empty string", () => {
    init(secretHash, expiration, "");
    const swapInfo = getSwap();
    expect(swapInfo.buyer).toBe("");
  });

  it("should init and claim", () => {
    expect(() => {
      init(secretHash, expiration, buyer);
      const str = String.UTF8.encode("hello world\n");
      const unit = Uint8Array.wrap(str);
      claim(unit);
    }).not.toThrow();
  });

  it("should throw secret hash doesn't match", () => {
    expect(() => {
      init(secretHash, expiration, buyer);
      const str = String.UTF8.encode("hello world");
      const unit = Uint8Array.wrap(str);
      claim(unit);
    }).toThrow("secret hash doesn't match");
  });

  it("should throw swap has expired", () => {
    expect(() => {
      init(secretHash, 0, buyer);
      const str = String.UTF8.encode("hello world\n");
      const unit = Uint8Array.wrap(str);
      claim(unit);
    }).toThrow("swap has expired");
  });

  it("should init and refund", () => {
    expect(() => {
      init(secretHash, 0, buyer);
      refund();
    }).not.toThrow();
  });

  it("should throw Refund not available", () => {
    expect(() => {
      init(secretHash, expiration, buyer);
      refund();
    }).toThrow("Refund not available");
  });
});
