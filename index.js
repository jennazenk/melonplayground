import {
  getConfig,
  getParityProvider,
  setEnvironment,
  getEnvironment,
  trace,
  toReadable,
  toProcessable,
  importWalletFromMnemonic,
  getQuoteAssetSymbol,
  getNativeAssetSymbol,
  getBalance,
  shutDownFund,
  setupFund,
  invest,
  signTermsAndConditions,
  getFundForManager,
  getParticipation,
  getVersionContract,
  getLastRequest,
  getOpenOrders,
  executeRequest,
  performCalculations,
  makeOrder,
  makeOrderFromAccount
} from "@melonproject/melon.js";
import BigNumber from "bignumber.js";

async function run() {
  const wallet = importWalletFromMnemonic("INSERT MNEMONIC");
  trace({
    message: `Running with wallet address: ${wallet.address}`
  });
  const shared = { etherBalance: {}, participation: {}, melonBalance: {} };

  const { providerType, api } = await getParityProvider(-1);

  setEnvironment({ api, account: wallet, providerType });

  const environment = getEnvironment();
  const config = await getConfig(environment);

  const quoteAssetSymbol = await getQuoteAssetSymbol(environment);
  const nativeAssetSymbol = await getNativeAssetSymbol(environment);

  trace(
    `ProviderType: ${environment.providerType}, quoteAssetSymbol: ${quoteAssetSymbol}, nativeAssetSymbol: ${nativeAssetSymbol}`
  );

  shared.etherBalance.initial = await environment.api.eth
    .getBalance(environment.account.address)
    .then(balance => toReadable(config, balance, config.nativeAssetSymbol));
  trace({ message: `Etherbalance: Ξ${shared.etherBalance.initial} ` });

  shared.melonBalance.initial = await getBalance(environment, {
    tokenSymbol: quoteAssetSymbol,
    ofAddress: environment.account.address
  });
  trace({ message: `Melon Balance: Ⓜ  ${shared.melonBalance.initial} ` });

  shared.config = await getConfig(environment);
  trace({
    message: `Got config w exchange adapter at ${shared.config
      .exchangeAdapterAddress}, exchange at ${shared.config
      .exchangeAddress} and priceFeed at ${shared.config.priceFeedAddress}`,
    data: shared.config
  });
}
run();
