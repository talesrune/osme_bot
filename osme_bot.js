//Updated 21 Apr 2022
const { Telegraf, Markup } = require('telegraf')

const token2 = 'your api key'; //please change this to your own telegram bot API key
if (token2 === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot2 = new Telegraf(token2)
let chatID;
let is_first = true

bot2.start((ctx) => ctx.reply('Welcome to Opensea/ME nft floor bot')
  .then(() => chatID = ctx.chat.id)
  .then(() => console.log(chatID))
  .then(() => { (is_first) ? begin_bot(): console.log("not going to run bot again")})
)

function checkLower(nft_name, low_target, current_floor, eth_or_sol) {
  if (Number(current_floor) <= Number(low_target)) {
      bot2.telegram.sendMessage(chatID,'<i><b>'+ nft_name + ' lower than ' + low_target + eth_or_sol + '!! Floor: '+ current_floor + eth_or_sol +  '</b></i>', { parse_mode: 'HTML' });
  }
}

function checkHigher(nft_name, high_target, current_floor, eth_or_sol) {
   if (Number(current_floor) >= Number(high_target)) {
       bot2.telegram.sendMessage(chatID,'<i><b>'+ nft_name + ' higher than ' + high_target + eth_or_sol + '!! Floor: '+ current_floor + eth_or_sol +  '</b></i>', { parse_mode: 'HTML' });
   }
 }

let is_calling = false;
bot2.command('call', async (ctx) => {
  console.log(ctx.chat);
  bot2.telegram.sendMessage(ctx.chat.id, "Lets check floor price! Standy..");
  is_calling = true;
  run()
})

bot2.launch()
console.log("Started..")

// Enable graceful stop
process.once('SIGINT', () => bot2.stop('SIGINT'))
process.once('SIGTERM', () => bot2.stop('SIGTERM'))

//////////////////////////////////////////UNCOMMENT ALL ABOVE WHEN DONE
const axios = require('axios');
const fs = require('fs');
let rawdata = fs.readFileSync('name_list.json');
let nft_list = JSON.parse(rawdata);

console.log(nft_list);

let floor_list = new Map();
let current_price_List = new Map();


function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

function updateMap(collect_name){
  let template = {
		"link" : "https://api-mainnet.magiceden.dev/v2/collections/888_anon_club/stats",
		"emoji": "🧹,💩,🍲",
		"market": "ME",
		"l_than": "0",
		"h_than" : "99",
		"hide" : "no",
		"variation" : "1"
	};

  template['link'] = "https://api-mainnet.magiceden.dev/v2/collections/" + collect_name + "/stats"
  nft_list[collect_name] = template; //insert new 
  fs.writeFile("name_list.json", JSON.stringify(nft_list, null, 2), function(err) {
   
    if (err) {
        console.log(err);
    } else {
      bot2.telegram.sendMessage(chatID, text = 'Successfully added ' + collect_name + ' to the list', { parse_mode: 'HTML' })
    }
  });

}

function updateMapOS(collect_name){
  let template = {
    "link" : "https://api.opensea.io/collection/karafuru?format=json",
		"emoji": "📈,🥺,🍲",
		"market": "OS_API",
		"l_than": "0",
		"h_than" : "99.9",
    "hide" : "no",
		"variation" : "0.1"
  };

  template['link'] = "https://api.opensea.io/collection/" + collect_name + "?format=json"
  nft_list[collect_name] = template; //insert new 
  fs.writeFile("name_list.json", JSON.stringify(nft_list, null, 2), function(err) {
   
    if (err) {
        console.log(err);
    } else {
      bot2.telegram.sendMessage(chatID, text = 'Successfully added ' + collect_name + ' to the list', { parse_mode: 'HTML' })
    }
  });

}

function removefromMap(collect_name){
  
  let isExisted = collect_name in nft_list;
  if (!isExisted) { 
    bot2.telegram.sendMessage(chatID, text = collect_name + ' not found', { parse_mode: 'HTML' })
    return
  }

  delete nft_list[collect_name]; //remove
  delete current_price_List[collect_name]; //remove from current price list
  delete floor_list[collect_name];

  fs.writeFile("name_list.json", JSON.stringify(nft_list, null, 2), function(err) {
   
    if (err) {
        console.log(err);
    } else {
      bot2.telegram.sendMessage(chatID, text = 'Successfully removed ' + collect_name + ' from the list', { parse_mode: 'HTML' })
    }
  });

}

function display_List(){

  let list_string = '';
  let header_string = '<b>Price Watchlist for OS and ME</b>\n'
  for(const key in current_price_List) {
    let e_o_s = (nft_list[key]["market"] == 'ME') ? 'sol': 'eth' 
    list_string += key + ': ' + current_price_List[key].toFixed(3) + ' ' + e_o_s + ', variation: ' + nft_list[key]["variation"]  + ' ' + e_o_s + '\n'
  }
  bot2.telegram.sendMessage(chatID, header_string + '<i><b>'+ list_string +   '</b></i>', { parse_mode: 'HTML' });

}

bot2.on('message', (ctx) => {
  try {
    var cmd_arr = ctx.message.text.split(' ')
    console.log(cmd_arr.length)
    let isUnkown = true;

    if (cmd_arr.length >= 3) {

      let isExisted = cmd_arr[1] in nft_list;
      if (!isExisted) { 
        bot2.telegram.sendMessage(chatID, text = cmd_arr[1] + ' not found', { parse_mode: 'HTML' })
        return
      }

      if (cmd_arr[0] == '/lower') {        
        ctx.telegram.sendMessage(ctx.message.chat.id, 'Edited lower price of ' + cmd_arr[1] + ' to ' + cmd_arr[2])

        nft_list[cmd_arr[1]]["l_than"] = cmd_arr[2]
        isUnkown = false
      } else if (cmd_arr[0] == '/higher') {
        ctx.telegram.sendMessage(ctx.message.chat.id, 'Edited higher price of ' + cmd_arr[1] + ' to ' + cmd_arr[2])

        nft_list[cmd_arr[1]]["h_than"] = cmd_arr[2]
        isUnkown = false
      } else if (cmd_arr[0] == '/vary') {
        ctx.telegram.sendMessage(ctx.message.chat.id, 'Edited variation of ' + cmd_arr[1] + ' to ' + cmd_arr[2])
        nft_list[cmd_arr[1]]["variation"] = cmd_arr[2]
        isUnkown = false
      }
    } else if (cmd_arr.length == 2) {
      if (cmd_arr[0] == '/addsol') {
        updateMap(cmd_arr[1])     	  
        isUnkown = false
			} else if (cmd_arr[0] == '/addeth') {
        updateMapOS(cmd_arr[1])
        isUnkown = false
			} else if (cmd_arr[0] == '/remove') {
        removefromMap(cmd_arr[1])
        isUnkown = false
      }

    } else if (cmd_arr.length == 1) {
      if (cmd_arr[0] == '/list') {
        display_List()
        isUnkown = false
      }
    }

    if(isUnkown){
      ctx.telegram.sendMessage(ctx.message.chat.id, 'Unknown command\n1. list\n2. addeth, addsol\n 3. remove\n 4. vary\n 5. lower, higher\n 6. call')
    }
  } catch(e) {
    console.log('error_getting_value' + e);
  }
})

async function run () {
        try {     
            console.log(getDateTime() + ' Scraping now...');
            for(const key in nft_list) {
              

              let delayres = await delay(500); //actual delay
       
              var emo_str = nft_list[key]["emoji"]
              var emo_arr = emo_str.split(',')
          
              console.log(key);
              let eth_or_sol;
              let value;
              let value2 = 0;
             
              try {
              
                if(nft_list[key]["market"] == 'ME') {
                  eth_or_sol = 'sol'

                  await axios.get(nft_list[key]["link"], {timeout:3000}).then(resp => {
                    console.log('end')
                    
                    value = resp.data['floorPrice'] *  Math.pow(10,-9)

                    value2 = resp.data['listedCount']
                  });
                } 
                else if (nft_list[key]["market"] == 'OS_API') {
                  eth_or_sol = 'eth'        
                
                  await axios.get(nft_list[key]["link"], {timeout:3000}).then(resp => {
                     value = resp.data['collection']['stats']['floor_price'] //.toString()
                  });

                }
             } catch (e) {
               console.log('error_getting_value' + e);
               continue
             }

              var isExisted = key in floor_list;
              if (!isExisted) { //if its new entry
                floor_list[key] = 0.0;
              }

              console.log( getDateTime() + ' Price is:', value);
              if(value == '---' || value == 0)
              {
                console.log("INVALID value, skip")
                continue
              } else {
                console.log("valid value")
              }

              if (value2 == 0) {
                value2 = ''
              } else {
                value2 = ', Items listed: ' + value2
              }

              //new tw
              current_price_List[key] = value;

              //new tw, price check
              checkLower(key, nft_list[key]["l_than"], value, eth_or_sol);
              checkHigher(key, nft_list[key]["h_than"], value, eth_or_sol);
              //new tw, end

              if (nft_list[key]["hide"] == 'no') {
                console.log("current value")
                console.log(Number(floor_list[key]))

                if (Number(value) >= (Number(floor_list[key]) + Number(nft_list[key]["variation"]))){
                  emoji = emo_arr[0]
                  bot2.telegram.sendMessage(chatID, text = '<i><b>'+ emoji + ' '+ key +' floor: '+ value.toFixed(3) + ' ' + eth_or_sol + ', p.val: ' + floor_list[key].toFixed(3) + value2 + '</b></i>', { parse_mode: 'HTML' })
                  floor_list[key] = value;
                }
                else if(Number(value) <= (Number(floor_list[key]) - Number(nft_list[key]["variation"]))){
                  emoji = emo_arr[1]
                  bot2.telegram.sendMessage(chatID, text = '<i><b>'+ emoji + ' '+ key +' floor: '+ value.toFixed(3) + ' ' + eth_or_sol + ', p.val: ' + floor_list[key].toFixed(3) + value2 + '</b></i>', { parse_mode: 'HTML' })
                  floor_list[key] = value;
                }
                else{
                    emoji = emo_arr[2]
                    if (is_calling) {
                        bot2.telegram.sendMessage(chatID, text = '<i><b>'+ emoji + ' '+ key +' floor: '+ value.toFixed(3) + ' ' + eth_or_sol + ', p.val: ' + floor_list[key].toFixed(3) + value2 + '</b></i>', { parse_mode: 'HTML' })
                    }
                }
              }

            }
            if (is_calling) {
                is_calling = false
            }
      
            console.log("browser closing")
           
        } catch (e) {
            console.log("Browser closing" + e)
            browser.close();
            console.log("error")
        
        }
}

async function checkAlive() {
  bot2.telegram.sendMessage(chatID, text = '<i><b>SIPHER</b></i> to show that the bot is functioning', { parse_mode: 'HTML' })
}


function getDateTime(){
  let unix_timestamp = Date.now();
  // Create a new JavaScript Date object based on the timestamp
  var date = new Date(unix_timestamp);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();
  // Will display time in 10:30:23 format
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  let yo = new Date().toISOString()
  //console.log( '[' + yo.substring(0,10) + ' ' + formattedTime + ']');
  date_str = '[' + yo.substring(0,10) + ' ' + formattedTime + ']';
  return date_str;
}

const close_Program = async () => {
  console.log(getDateTime() + ' Exiting...');
  process.exit(1);
}
///////////////////////////////////
// START/STOP
///////////////////////////////////
let timmy2
//new tw

function begin_bot(){
  is_first = false
  console.log(getDateTime() + ' Timer starts');
  timmy2 = setInterval(run, 0.8 * 60 * 1000); //48 sec
  timmy2 = setInterval(checkAlive, 2* 60 * 60 * 1000); //2 hours
  run()
}
