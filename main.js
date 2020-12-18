'use strict';

require("dotenv").config();

const curTime = require("./util_time");
const email = require("./util_email");

const { ApiPromise } = require("@polkadot/api");
const { WsProvider } = require("@polkadot/rpc-provider");
const { options } = require("@chainx-v2/api");

async function notify(height, addr, slashAmount) {
    let content = 'Slash happened at ' + height + 'for ' + addr + 'of amount ' + slashAmount;
    console.log(content);
    if (process.env.email_send.toLowerCase() == 'true') {
        console.log('Sending email ...');
        // email.sendMail('ChainX Slash Notice', content);
    }
    
}

async function listenBlock(api, addr, slashAmount) {
    const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
        console.log(`Chain Block: #${header.number}`);
        unsubscribe();
        notify(header.number, addr, slashAmount);
    });
}

async function main() {
    console.log('Env is:');
    console.log('chainx_ws_addr:', process.env.chainx_ws_addr);
    console.log('email_send:', process.env.email_send);
    console.log('email_host:', process.env.email_host);
    console.log('email_port:', process.env.email_port);
    console.log('email_ssl:', process.env.email_ssl);
    console.log('email_uid:', process.env.email_uid);
    console.log('email_from:', process.env.email_from);
    console.log('email_to:', process.env.email_to);



    const wsProvider = new WsProvider(process.env.chainx_ws_addr);
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

    api.query.system.events((events) => {
        console.log(`\n[Debug] Received ${events.length} events:`);

        // Loop through the Vec<EventRecord>
        events.forEach((record) => {
            // Extract the phase, event and the event types
            const { event, phase } = record;
            const types = event.typeDef;

            if (event.method == 'Slashed') {
                // Show what we are busy with
                console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
                console.log(`event.meta.doc:\t${event.meta.documentation.toString()}`);

                let addr = 'N/A';
                let slashAmount = 'N/A';
                // Loop through each of the parameters, displaying the type and data
                event.data.forEach((data, index) => {
                    console.log(`loop_event.data:\t${types[index].type}: ${data.toString()}`);
                    if (types[index].type == 'AccountId') {
                        addr = data.toString();
                    }
                    if (types[index].type == 'Balance') {
                        slashAmount = data.toString();
                    }
                    listenBlock(api, addr, slashAmount);
                });
            }

        }); // end of events.forEach

    });
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
