'use strict';

require("dotenv").config();
const cfg = require("./config");
const curTime = require("./util_time");
const email = require("./util_email");

const { ApiPromise } = require("@polkadot/api");
const { WsProvider } = require("@polkadot/rpc-provider");
const { options } = require("@chainx-v2/api");

async function notify(height, addr, slashAmount) {
    let content = 'Slash happened at ' + height + ' for ' + cfg.validators[addr].name + ' with amount ' + slashAmount;
    console.log(curTime(), content);
    let to = cfg.validators[addr].email_to.join(', ');
    if (cfg.email.enable && to != "") {
        console.log(curTime(), 'Sending email ...');
        email.sendMail('ChainX20 Slash Notice', content, to);
    }
    
}

async function listenBlock(api, addr, slashAmount) {
    const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
        console.log(curTime(), `Chain Block: #${header.number}`);
        unsubscribe();
        notify(header.number, addr, slashAmount);
    });
}

async function main() {
    console.log(curTime(), 'Slash Notice for ChainX20. Version: 0.9.0');
    console.log('Env is:');
    console.log('chainx_ws_addr:', process.env.chainx_ws_addr);
    console.log('Cfg is:');
    console.log('email enabled:', cfg.email.enable);
    console.log('email host:', cfg.email.host);
    console.log('email port:', cfg.email.port);
    console.log('email ssl:', cfg.email.ssl);
    console.log('email uid:', cfg.email.uid);
    console.log('email from:', cfg.email.from);
    console.log('');

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
        console.log(curTime(), `[Debug] Received ${events.length} events.`);

        // Loop through the Vec<EventRecord>
        events.forEach((record) => {
            // Extract the phase, event and the event types
            const { event, phase } = record;
            const types = event.typeDef;

            if (event.method == 'Slashed') {

                // Show what we are busy with
                console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
                console.log(`\t${event.meta.documentation.toString()}`);

                let addr = 'N/A';
                let slashAmount = 'N/A';
                // Loop through each of the parameters, displaying the type and data
                event.data.forEach((data, index) => {
                    console.log(`\t\t${types[index].type}: ${data.toString()}`);
                    if (types[index].type == 'AccountId') {
                        addr = data.toString();
                    }
                    if (types[index].type == 'Balance') {
                        slashAmount = data.toString();
                    }
                });
                if (addr in cfg.validators) {
                    listenBlock(api, addr, slashAmount);
                }
                
            }

        }); // end of events.forEach

    });
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
