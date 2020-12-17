'use strict';
  
const curTime = require("./util_time");

const { ApiPromise, Keyring } = require("@polkadot/api");
const { stringToU8a, u8aToHex } = require('@polkadot/util');
const { WsProvider } = require("@polkadot/rpc-provider");
const { options } = require("@chainx-v2/api");



async function listenBlock(api) {
const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
    console.log(`Chain Block: #${header.number}`);
    // unsubscribe();
});
return unsubscribe;
}

async function main() {
const wsProvider = new WsProvider("wss://mainnet.chainx.org/ws");
// const wsProvider = new WsProvider("ws://121.199.57.192:8087");
const api = await ApiPromise.create(options({ provider: wsProvider }));
await api.isReady;


const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
]);

console.log(curTime(),
    `You are connected to chain ${chain} using ${nodeName} v${nodeVersion} `
);

listenBlock(api);

api.query.system.events((events) => {
    console.log(`\nReceived ${events.length} events:`);

    // Loop through the Vec<EventRecord>
    events.forEach((record) => {
    // Extract the phase, event and the event types
    const { event, phase } = record;
    const types = event.typeDef;

    if (event.method=='Slashed') {
        // Show what we are busy with
        console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        console.log(`event.meta.doc:\t${event.meta.documentation.toString()}`);

        // Loop through each of the parameters, displaying the type and data
        event.data.forEach((data, index) => {
        console.log(`loop_event.data:\t${types[index].type}: ${data.toString()}`);
        });
    }

    }); // end of events.forEach

});
}

main().catch((error) => {
console.error(error);
process.exit(-1);
});
