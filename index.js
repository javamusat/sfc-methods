const {Contract, JsonRpcProvider, Wallet} = require("ethers");
const sfcAbi = require("./sfc.abi.json");
const generateWithdrawRequestId = () => {
    const hexString = Array(16)
        .fill(0)
        .map(() => Math.round(Math.random() * 0xf).toString(16))
        .join("");

    const randomBigInt = BigInt(`0x${hexString}`);
    return randomBigInt.toString();
};

// ** SET PARAMS BELOW FOR RUNS **

// How to run delegate
// Set DELEGATE_PARAMS
// RUN: `PKEY=your_private_key npm run delegate`
const DELEGATE_PARAMS = {
    validator_id: 1,
    amount_in_wei: 1_000_000_000_000,
}

// How to run undelegate
// Set UNDELEGATE_PARAMS -- wr_id is auto generated
// RUN `PKEY=your_private_key npm run undelegate`
const UNDELEGATE_PARAMS = {
    validator_id: 1,
    wr_id: generateWithdrawRequestId(),
    amount_in_wei: 1_000_000_000_000,
}

// How to run withdraw
// Set WITHDRAW_PARAMS -- use valid withdraw_request_id created with undelegate action
// RUN `PKEY=your_private_key npm run withdraw`
const WITHDRAW_PARAMS = {
    validator_id: 1,
    wr_id: "3623143532814846030",
    amount_in_wei: 1_000_000_000_000,
}


// Configure SFC
const SFC_ADDRESS = "0xfc00face00000000000000000000000000000000";
const provider = new JsonRpcProvider("https://rpc.ankr.com/fantom")
const signer = new Wallet(process.env.PKEY, provider);
const walletWithProvider = signer.connect(provider);
const sfc = new Contract(SFC_ADDRESS, sfcAbi, walletWithProvider);

const delegate = async () => {
    const { gasPrice } = await provider.getFeeData();
    try {
        const result = await sfc.delegate(
            DELEGATE_PARAMS.validator_id,
            {value: DELEGATE_PARAMS.amount_in_wei, gasPrice: gasPrice * 2n }
        );
        console.log(`[DELEGATE] success | hash: ${result.hash}`);
    } catch (e) {
        console.error("delegate failed", e);
    }
}

const undelegate = async () => {
    const { gasPrice } = await provider.getFeeData();
    try {
        const result = await sfc.undelegate(
            UNDELEGATE_PARAMS.validator_id,
            UNDELEGATE_PARAMS.wr_id,
            UNDELEGATE_PARAMS.amount_in_wei,
            { gasPrice: gasPrice * 2n }
        );

        console.log(`[UNDELEGATE] success with wr_id: ${UNDELEGATE_PARAMS.wr_id} | hash: ${result.hash}`);
    } catch (e) {
        console.error("undelegate failed", e)
    }
}

const withdraw = async () => {
    const { gasPrice } = await provider.getFeeData();
    try {

        const result = await sfc.withdraw(WITHDRAW_PARAMS.validator_id, WITHDRAW_PARAMS.wr_id, { gasPrice: gasPrice * 2n });
        console.log(`[WITHDRAW] success  | hash: ${result.hash}`);
    } catch (e) {
        console.error("withdraw failed", e)
    }
}

const runMethod = () => {
    console.log(`run method: ${process.argv[2]}`);
    if (process.argv[2] === "delegate") {
        return delegate();
    }
    if (process.argv[2] === "undelegate") {
        return undelegate();
    }
    if (process.argv[2] === "withdraw") {
        return withdraw();
    }
}

runMethod().then(() => console.log("end")).catch(console.error);
