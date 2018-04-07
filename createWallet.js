import { createWallet } from "@melonproject/melon.js";

async function createWallet() {
  console.log("Creating wallet");
  const wallet = createWallet();
  console.log("My wallet ", wallet);
}
createWallet();
