import { createWallet } from "@melonproject/melon.js";

async function wallet() {
  console.log("Creating wallet");
  const wallet = createWallet();
  console.log("My wallet ", wallet);
}
wallet();
