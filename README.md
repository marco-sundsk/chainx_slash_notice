# chainx_slash_notice

A Tool for monitor and notify slash action on ChainX2.0


## Init Environment

```shell
$ yarn
$ cp .env.example .env
$ cp config.json.example config.json
```
## Env
```shell
$ vim .env
```
You can change `chainx_ws_addr` to your own ws provider, like ws://your-node-ip:your_ws_port

## Config
```shell
$ vim config.json
```
Add validators you care about to `validators`.  
Modify `email` to your own email settings.  


## Logic
* listen to Slashed Event;
* filter those validators you care about;
* get cur block height;
* send Slash info through email;

## TODO
Listenning to Events is kind of heavy activity. In addotion, it is NOT good to keep persistent connection with ws provider in maintanance scenario.  
So, later, I will change to read histroy block data to retrieve events instead of using listenning.

