import * as btc from "@scure/btc-signer";
import mempoolJS from "@mempool/mempool.js";
import { hex } from "@scure/base";
import _ from "lodash";

interface UTXO {
    txid: string;
    status: any;
    value: number;
    vout: number;
}

interface Info {
    height: number;
    payment: {
        p2wpkh: string;
    };
    fees: {
        estimated_hashrate: number,
        feerate: number
    }[
        
    ]
}

const getInfo = async () => {
    const response: Info = await fetch("https://shield.rebarlabs.io/v1/info").then((res) => res.json());

    return response;
}

const getUtxos = async ( p2wpkh: string ): Promise<UTXO[]> => {
    const { bitcoin: { addresses } } = mempoolJS({ hostname: 'mempool.space' });
    return await addresses.getAddressTxsUtxo({ address: p2wpkh });
}

export const buildTransaction = async ( publicKey: string, recipientAddress: string, amountSats: number, cb?: (data: any) => void) => {
    const spend = btc.p2wpkh(hex.decode(publicKey), btc.NETWORK); // any transaction format is supported

    const info = await getInfo();

    const utxos = (await getUtxos(spend.address!)).map((utxo) => {
        return {
            ...spend,
            txid: hex.decode(utxo.txid),
            index: utxo.vout,
            sequence: 0xfffffffe-1, // can set sequence to whatever is desired 
            witnessUtxo: {
                script: spend.script!, amount: BigInt(utxo.value)
            }
        }
    });


    // add rebar fee output 
    const outputs = [
        {
            address: info.payment.p2wpkh,
            amount: BigInt(1)
        },
        {
            address: recipientAddress,
            amount: BigInt(amountSats)
        }
        // add any other outputs here
    ]

    if (info.fees.length <= 0) {
        throw new Error("No fee rates found")
    }

    // select intended fee rate 
    const selectedFeeRate = _.sample(info.fees)!

    const selected =  btc.selectUTXO(utxos, outputs, 'default', {
        changeAddress: spend.address!,
        feePerByte: BigInt(Math.round(selectedFeeRate.feerate)), // round feerate 
        bip69: true, // lexicographical Indexing of Transaction Inputs and Outputs
        createTx: true, // create tx with selected inputs/outputs
        network: btc.NETWORK,
    })

    // find rebar fee output index
    const rebarFeeIndex = selected?.outputs.findIndex(({ address }: any) => {
        return address == info.payment.p2wpkh
    })

    if (rebarFeeIndex === -1) {
        throw new Error("Rebar fee output not found")
    }

    // update rebar fee output to the selected fee rate
    selected?.tx!.updateOutput(rebarFeeIndex!, {
        amount: selected.fee! + BigInt(1) // add 1 to account for the sat missed in recomputation
    });

    // ensure no leftover sats 
    const totalInputAmount = _.reduce(selected?.inputs, (sum, input) => {
        return sum + Number(input.witnessUtxo!.amount)
    }, 0)

    const totalOutputAmount = _.reduce(selected?.outputs, (sum, output) => {
        return sum + Number(output.amount)
    }, 0)

    if ((BigInt(totalInputAmount - totalOutputAmount) != (selected?.fee!))) {
        throw new Error("Leftover sats found")
        // leftover sats will leak rebar transactions
    }


    const unsignedPSBT = hex.encode(selected?.tx!.toPSBT()!)

    // can show data to user 
    const renderData = {
        feeRate: selectedFeeRate.feerate,
        paymentAddress: info.payment.p2wpkh,
        fee: Number(selected?.fee),
        hashPercent: (selectedFeeRate.estimated_hashrate * 100)
    }
    cb?.(renderData)

    // you can now use a wallet to sign this psbt
    return unsignedPSBT
}

export const signPSBT = async (unsignedPSBT: string, cb: (hex: string, finalize: boolean) => Promise<object | undefined>, setter: (tx: string) => void) => {
    const { signedPsbtHex }: any = await cb(unsignedPSBT, true)

    if (!signedPsbtHex) {
        throw new Error("PSBT signing failed");
    }

    // get signed transaction from signedPSBT
    const signedTxHex = (btc.Transaction.fromPSBT(hex.decode(signedPsbtHex))).hex

    setter(signedTxHex)
}

export const sendTransaction = async (signedTx: string, cb?: (txid: string) => void) => {
    const reponse = await fetch("https://shield.rebarlabs.io/v1/rpc", {
        method: "POST",
        body: JSON.stringify({
            jsonrpc: "1.0",
            method: "sendrawtransaction",
            id: 1,
            params: [signedTx]
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })

    let data = await reponse.json()

    cb?.(data.result)
}

export const watchTransaction = async (txid: string | undefined, cb?: (txid: string) => void): Promise<boolean> => {
    if (!txid) {
        cb?.('')
        return false
    }

    const response = await fetch(`https://shield.rebarlabs.io/v1/txstatus?txid=${txid}`)

    if (!response.ok) {
        cb?.('')
        return false
    }

    return response.ok 
}