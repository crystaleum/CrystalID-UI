//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    let message;
    function statusMessage(message){
        PassportPipeline.checkDaemon("crfi");
        if(sessionStorage.fromLogin == "true"){
        ModelViewController.refreshDataLight();
            $('#status-area').flash_message({
            text: message,
            how: 'html'
            });
        }
        message = 'Folio Updated!';
        setInterval( function() { statusMessage(message); }, 10000 );
    };
    
    
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});


$.fn.flash_message = function(options) {
      options = $.extend({
        text: 'Done',
        time: 1000,
        how: 'before',
        class_name: ''
      }, options);      
      return $(this).each(function() {
        if( $(this).parent().find('.flash_message').get(0) )
          return;
        var message = $('<span />', {
          'class': 'flash_message ' + options.class_name,
          text: options.text
        }).hide().fadeIn('fast');
        $(this)[options.how](message);
        message.delay(options.time).fadeOut('normal', function() {
          $(this).remove();
     });
  });
};


$(document).on("click", ".coin-selector", function(){
    if(!$(this).hasClass("btn-selected")){
        $(".coin-selector").removeClass("btn-selected");
        $(this).addClass("btn-selected")
    }
});

$(document).on("click", "blockquote", function(){
    $("blockquote").removeClass("selected");
    $(this).addClass("selected");
});
 
var ModelViewController = {
    initLevel: 0,
    coinState: 0,
    thisIs: 0,
    thisIs1: null,
    thisIs2: null,
    thisIs3: null,
    thisIs4: null,
    thisIs5: null,
    returnState: function(which){
        if(!which){
            which = 0;
        }
        return ModelViewController.coinState = which;
    },
    //coins: { coin: ['crfi', 'etnx','etnxp','ltnx','gldx'] },
    coins: { coin: 'crfi' },
    setCoinData: function(coin, data){
        return localStorage.setItem("crystalid_"+coin+"Data", data);       
    },
    getCoinData: function(coin){
        if(!coin){
            coin = 'crfi';
        }
        coin = 'crfi';
        if(coin){
            function whichData(coinData){
                ModelViewController.coinState++ 
                try{ return JSON.parse(localStorage.getItem(coinData)); }
                catch(e) { console.log(e); return null; }
            }
            switch (coin) {
                case 'crfi':
                    return whichData("crystalid_crfiData");
                case 'etnx':
                    return whichData("crystalid_etnxData");
                default:
                    break;
            }; 
        } else {
             // loop through coins.coin and get all coinData
            let coins = ModelViewController.coins.coin;
            for (var i=0;i<coins.length;i++) {
                ModelViewController.getCoinData(coins[i]);
        };
    };
    },
    formatCoinTransaction: function(coins, coinSymbol, units){
        coinSymbol = 'crfi';
    const coinUnits = coinSymbol==="crfi" ? 1 : coinSymbol==="etnx" ? 10000000000000000 : coinSymbol==="etnxp" ? 10000 : coinSymbol==="etnxc" ? 1 : coinSymbol==="ltnx" ? 1 : coinSymbol==="gldx" ? 1 : units;
    var balancedCoins = coins * coinUnits; 
    return balancedCoins;
    },
    formatCoinUnits: function(coins, coinSymbol, units){
        coinSymbol = 'crfi';
    const coinUnits = coinSymbol==="crfi" ? 1000000000000 : coinSymbol==="etnx" ? 100000000 : coinSymbol==="etnxp" ? 100 : coinSymbol==="etnxc" ? 100 : coinSymbol==="ltnx" ? 100000000 : coinSymbol==="gldx" ? 1000000000000 : units;
    var coinDecimalPlaces = coinUnits.toString().length - 1;
    var balancedCoins = (parseInt(coins || 0) / coinUnits).toFixed(units || coinDecimalPlaces);
    return balancedCoins;
    },
    fillData: function(){      
        var coinsymbol = "crfi";
        var crfiData = this.getCoinData("crfi");
        if(crfiData != null){
            const crfiLockedBalance = this.formatCoinUnits(crfiData.balances.balance, "crfi")
            const crfiBalance = this.formatCoinUnits(crfiData.balances.unlocked_balance, "crfi")
            $("#crfi-wallet").html(crfiData.address);
            console.log(crfiData);
            $("#crfi-balance").html(crfiLockedBalance);
            $("#crfi-unlocked-balance").html(crfiBalance);
            $(".crfi-unlocked-balance").html(crfiBalance);
            $(".claims").html(crfiBalance);
            
            // proto
            PassportPipeline.remoteCallRates("crfi").then((response) => {
            if(response){
                console.log(response); 
                // proto
                console.log("balance USDt/CRFI rate " + response.crystaleum.usd)
                console.log("crystaleum USDt/CRFI value " + crfiBalance * response.crystaleum.usd)
                console.log("crystaleum BTC/CRFI value " + crfiBalance * response.crystaleum.btc)
                console.log("crystaleum ETH/CRFI value " + crfiBalance * response.crystaleum.eth)
                console.log("crystaleum LTC/CRFI value " + crfiBalance * response.crystaleum.ltc)
                let btcRates = crfiBalance * response.crystaleum.btc;
                let usdTrates = crfiBalance * response.crystaleum.usd;
                let ethTrates = crfiBalance * response.crystaleum.eth;
                let ltcTrates = crfiBalance * response.crystaleum.ltc;
                //console.log(currency(usdTrates, { fromCents: true, precision: 0, separator: ',' }).format()); // "123456" => "123456.00" =>  "123,456.00"
                var rateUSDformatCurrency = currency(usdTrates, { symbol: '₮', fromCents: true, precision: 0, separator: ',' }).format(); // "123456" => "123456.00" =>  "123,456.00"
                var rateBTCformatCurrency = currency(btcRates, { symbol: '₿', separator: ',' }).format(); // "123456" => "123,456.00" ? Ξ Ł
                var rateETHformatCurrency = currency(ethTrates, { symbol: 'Ξ', separator: ',' }).format(); // "123456" => "123,456.00" ? Ξ Ł
                var rateLTCformatCurrency = currency(ltcTrates, { symbol: 'Ł', separator: ',' }).format(); // "123456" => "123,456.00" ? Ξ Ł
                // display folio values 
                $("#crfi-usdt-balance").html(rateUSDformatCurrency)
                $("#crfi-btc-balance").html(rateBTCformatCurrency)
                $("#crfi-eth-balance").html(rateETHformatCurrency);
                $("#crfi-ltc-balance").html(rateLTCformatCurrency);
                
                // Confirm state of rates
                PassportPipeline.saveRates(usdTrates, btcRates, ethTrates, ltcTrates, crfiBalance, "crfi");
                if(response.hasOwnProperty("error")){
                    PassportPipeline.performOperation(coinSymbol, ModelViewController.initCoin);
                    return;
                }
            }
        });
    }
    },
    fillHistory: function(){
        var crfiData = ModelViewController.getCoinData("crfi");
        if(crfiData != null){
            if(crfiData.txs.in || crfiData.txs.out){
                ModelViewController.fillHistoryRows("CRFI", "Receive", crfiData.txs.in);
                ModelViewController.fillHistoryRows("CRFI", "Send", crfiData.txs.out);
                console.log(crfiData);
            }
        }
    },
    blockchainExplorerLink: function(block, height, txid, coin){
        const secureSocketLayer = 'https://';
        const blockchainLink = PassportPipeline.getBlockchainLink(coin);
        const txidURL = '/tx/' + txid;
        const heightURL = '/block/' + height;
        const operative = block===true ? heightURL : txidURL;
        const blockchainExplorerURL = secureSocketLayer + blockchainLink + operative;

        return blockchainExplorerURL;
    },
    fillHistoryRows: function(coin, type, items){
        var tbody = $("#transaction-history").find('tbody');
        var thisIsVar = ModelViewController.thisIs;
//         if(thisIsVar > 8){
//             $(".row_CRFI").empty();
//         }
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            ModelViewController.thisIs++;
            console.log("item.height: " + item.height);
            console.log("thisIsVar: " + thisIsVar);
        if(items[4] != undefined){
                if (ModelViewController.thisIs1 == null){
            ModelViewController.thisIs1 = items[0].height;
            console.log(ModelViewController.thisIs1);
                }
                if (ModelViewController.thisIs2 == null){
            ModelViewController.thisIs2 = items[1].height;
            console.log(ModelViewController.thisIs2);
                }
                if (ModelViewController.thisIs3 == null){
            ModelViewController.thisIs3 = items[2].height;
            console.log(ModelViewController.thisIs3);
                }
                if (ModelViewController.thisIs4 == null){
            ModelViewController.thisIs4 = items[3].height;
            console.log(ModelViewController.thisIs4);
                }
                if (ModelViewController.thisIs5 == null){
            ModelViewController.thisIs5 = items[4].height;
            console.log(ModelViewController.thisIs5);
                }
        };
//         if(ModelViewController.thisIs1 != items[1].height && items[0] != undefined){
//             //test ifnot()
//             console.log('New transaction inbound!');
//         } else {
//             console.log("No new transactions");
//         };
            tbody.append( "<tr class='row_" + coin +"'>" +
                            "<td>" + coin + "</td>" + 
                            "<td>" + type + "</td>" + 
                            "<td>" + this.formatCoinUnits(item.amount, coin.toLowerCase()) + "</td>" + 
                            "<td>" + "<a target='_blank' " + "href='"+this.blockchainExplorerLink(true, parseInt(item.height), item.txid, coin.toLowerCase())+" '>" + item.height + "</td>" + 
                            "<td>" + "<a target='_blank' " + "href='"+this.blockchainExplorerLink(false, parseInt(item.height), item.txid, coin.toLowerCase())+" '>" + item.txid + "</a>" + "</td>" + 
                          "</tr>" );
        }
    },
    initCoin: function(coinSymbol){
        console.log("3");
        PassportPipeline.setMethod('getaddr');
        PassportPipeline.loadParams();
        console.log(PassportPipeline.passportParams);
        if(coinSymbol){
                ModelViewController.coinState++
            }
        PassportPipeline.remoteCall(coinSymbol).then((response) => {
            if(response){
                console.log(response); 
                let passportBalance = JSON.parse(response);
                console.log(passportBalance);
                if(passportBalance.hasOwnProperty("error")){
                    PassportPipeline.performOperation(coinSymbol, ModelViewController.initCoin);
                    return;
                }
                else if(!passportBalance.hasOwnProperty("error")) {
                    ModelViewController.setCoinData(coinSymbol, response);
                }
            }
            $.event.trigger({
                type: "init.done",
                coin: coinSymbol
            });
        });
    },
    initVerification: function(coinSymbol){
            if(coinSymbol){
                ModelViewController.coinState++
            }

            if(!PassportPipeline.hasValidSession())
            {
                location.href = "verify.html";
            }

            $.event.trigger({
                type: "init.done",
                coin: coinSymbol
            });
    },
    refreshData: function(){
        $("#spinner-modal").modal('show');
        PassportPipeline.loadCode();
        PassportPipeline.performOperation("crfi", ModelViewController.initCoin);
    },
    refreshDataLight: function(){
        PassportPipeline.loadCode();
        PassportPipeline.performOperation("crfi", ModelViewController.initCoin);
    },
};

$(document).on("init.done", function(e){
    console.log(e.type + " - " + e.coin);
    ModelViewController.initLevel++;
    // ModelViewController.initLevel == 1 means crfi loaded proper
    if(ModelViewController.initLevel >= 1){
        $("#spinner-modal").modal('hide');
         
        if(location.pathname.indexOf("login") > -1)
            location.href = location.href.replace("login", "index");
        else
            ModelViewController.fillData();
    }
});

$(document).on("click", "#logout", function(){
    let lightMode =  sessionStorage.getItem("light-mode");
    sessionStorage.clear();
    sessionStorage.setItem("light-mode", lightMode);
    localStorage.clear();
    location.href = "login.html";
});

$(document).on("click", "#light-mode", function(){
    sessionStorage.setItem("light-mode", true);
    $("body").addClass("light");
});

$(document).on("click", "#dark-mode", function(){
    sessionStorage.setItem("light-mode", false);
    $("body").removeClass("light");
});
