# Opensea and MagicEden NFT floor Telegram bot	

This telegram bot is useful for tracking nft collections' floor price on Opensea and Magic Eden.
## Features
- Simple to setup
- Adds and removes nft collection
- Set price alerts of nft collection
- Price variation alerts for each nft collection

<img src="https://github.com/talesrune/osme_bot/blob/main/front_image2.png" alt="drawing" width="500"/>

## Installation

```sh
Recommended Ubuntu ver.: 20
1. sudo apt install nodejs
2. sudo apt install npm
3. npm install telegraf@3.38.0
4. npm install axios
5. sudo chmod 777 name_list.json
```

## Starting the bot
```sh
To run program: node osme_bot.js
Program works with windows too.
Search for @OSME_nft_bot on Telegram
Use /start on telegram chat to begin the bot
```

Command list:
> 1. list -> Returns a list of nft collections that you have added
>   * E.g. /list 
> 2. addeth, addsol -> Add a new nft collection to the list
>   * E.g. /addeth froyokittenscollection
>   * E.g. /addsol 888_anon_club
> 3. remove -> Remove a nft collection from the list
>   * E.g. /remove froyokittenscollection
>   * E.g. /remove 888_anon_club
> 4. vary -> Edit variation of price of nft collection
>   * E.g. /vary froyokittenscollection 0.2
> 5. lower, higher -> Edit lower/upper thresholds of floor price of nft collection
>   * E.g. /lower froyokittenscollection 0.05
>   * E.g. /higher froyokittenscollection 0.4
> 6. call -> Calls for the most updated floor price of nft collections
>   * E.g. /call