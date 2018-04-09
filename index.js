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
  const wallet = importWalletFromMnemonic(
    "dinosaur pulse rice lumber machine entry tackle off require draw edge almost"
  );
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

  // // If wallet already has a fund, need to shut it down before creating a new one -Only for integration purposes
  const versionContract = await getVersionContract(environment);
  let managerToFunds = await versionContract.instance.managerToFunds.call({}, [
    wallet.address
  ]);
  if (managerToFunds !== "0x0000000000000000000000000000000000000000") {
    console.log("Existing fund needs to be shut down: ", managerToFunds);
    await shutDownFund(environment, { fundAddress: managerToFunds });
    console.log("Shutting down existing fund");
    managerToFunds = await versionContract.instance.managerToFunds.call({}, [
      environment.account.address
    ]);
  }

  // SETUP FUND
  const signature = await signTermsAndConditions(environment);
  shared.vaultName = "WOMEN PLUS PLUS";
  shared.vault = await setupFund(environment, {
    name: shared.vaultName,
    signature
  });
  trace({
    message: `Fund Created: ${shared.vault.name} (${shared.vault
      .id}) at ${shared.vault.address}`,
    data: shared
  });

  // INVEST 10 MLN IN MY FUND

  shared.participation.initial = await getParticipation(environment, {
    fundAddress: shared.vault.address,
    investorAddress: environment.account.address
  });

  shared.initialCalculations = await performCalculations(environment, {
    fundAddress: shared.vault.address
  });

  trace({
    message: `Initial calculations- GAV: ${shared.initialCalculations
      .gav}, NAV: ${shared.initialCalculations.nav}, Share Price: ${shared
      .initialCalculations.sharePrice}, totalSupply: ${shared
      .initialCalculations.totalSupply}`,
    data: shared
  });

  shared.subscriptionRequest = await invest(environment, {
    fundAddress: shared.vault.address,
    numShares: new BigNumber(10),
    offeredValue: new BigNumber(10),
    isNativeAsset: false
  });

  trace({
    message: `Subscribe requested. shares: ${shared.subscriptionRequest
      .numShares}`,
    data: shared
  });

  shared.lastRequest = await getLastRequest(environment, {
    fundAddress: shared.vault.address,
    investorAddress: environment.account.address
  });

  shared.executedSubscriptionRequest = await executeRequest(environment, {
    id: shared.subscriptionRequest.id,
    fundAddress: shared.vault.address
    // 0,
  });

  trace(`executedSubscriptionRequest ${shared.executedSubscriptionRequest}`);

  shared.participation.invested = await getParticipation(environment, {
    fundAddress: shared.vault.address,
    investorAddress: environment.account.address
  });

  trace({
    message: `Subscribe request executed. Personal stake: ${shared.participation
      .invested.personalStake}`
  });

  shared.midCalculations = await performCalculations(environment, {
    fundAddress: shared.vault.address
  });

  trace({
    message: `Mid calculations- GAV: ${shared.midCalculations
      .gav}, NAV: ${shared.midCalculations.nav}, Share Price: ${shared
      .midCalculations.sharePrice}, totalSupply: ${shared.midCalculations
      .totalSupply}`,
    data: shared
  });

  // MAKE AN ORDER ON THE EXCHANGE
  shared.fundOrder = await makeOrder(environment, {
    fundAddress: shared.vault.address,
    sellWhichToken: quoteAssetSymbol,
    buyWhichToken: nativeAssetSymbol,
    sellHowMuch: new BigNumber(7),
    buyHowMuch: new BigNumber(1)
  });

  trace({
    message: `Fund made order with id: ${shared.fundOrder.id}`
  });
}
run();
