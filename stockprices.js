// https://www.interviewcake.com/question/stock-price

// Suppose we could access yesterday's stock prices as an array, where:

// * The indices are the time in minutes past trade opening time, which was 9:30am local time.
// * The values are the price in dollars of Apple stock at that time.
// * For example, if the stock cost $500 at 10:30am, stock_prices_yesterday[60] = 500.

// Write an efficient function that takes stock_prices_yesterday and returns the best profit I could have made from 1 purchase and 1 sale of 1 Apple stock yesterday.

// No "shorting"—you must buy before you sell. You may not buy and sell in the same time step (at least 1 minute must pass).

var mockStock = function (price, amp, mom) {
  var stock = {};
  // Market opens: 9:30am EST, 4:30 UTC
  var opens = 14.5;
  // Market closes: 4:00pm EST, 21:00 UTC
  var closes = 21;
  // Duration in minutes
  var duration = (closes - opens) * 60;
	// Populate the array with one price for every minute in the duration
	var populatePrices = function (your_amp, your_mom) {
    var prices = [price]
    // The number of minutes since the market opened...makes the code read easier
    var time_now = prices.length;
		// The least a stock could conceivably be worth (in cents)
    var min_price = 0.0001; // One 10,000th of a cent
	  // The most a stock could conceivably be worth (in cents)...pretty sure they'd split it way before this
    var max_price = 1000000; // 10,000 dollars
    // The most a stock price will change (as a percentage) in any given minute
	  var amplitude = your_amp || 0.01; // Thus named just to set you up for a lame joke later
	  // The tendency for the price to continue a trend (of increase or decrease) from >0.50 (weak) to <1 (strong)
    // A value of exactly 0.50 would be neutral (could go either way), and a value of 1 would be absolute (trend would never change)
	  // Q: What would be the meaning of a momentum less than 0.50? And what would be the effects? 
	  // A: It would be more likely to change directions (i.e. oscillate) than to trend.
    var momentum = your_mom || 0.50; // Get it? Your mom!? Ha! *sigh*
    while (time_now < duration) {
      // We want to know the current price...default to opening price
      var current_price = (time_now >= 1) ? prices[(time_now - 1)] : price;
      // We want to know the previous price...default to current price
      var previous_price = (time_now >= 2) ? prices[(time_now - 2)] : current_price;
      // Based on the previous and current price, are we headed up or down? 
      var trend = (current_price > previous_price) ? "increase" : (current_price === previous_price) ? "steady" : "decrease";
      // Calculate the price range within which it might increase or decrease
      switch (trend) {
      	case "increase": 
          var max_next_price = current_price + (momentum * amplitude * current_price);
          var min_next_price = current_price - ((1 - momentum) * amplitude * current_price);
      	  break;
        case "steady":
          var max_next_price = current_price + (0.50 * amplitude * current_price);
          var min_next_price = current_price - (0.50 * amplitude * current_price);
          break;
        case "decrease":
          var max_next_price = current_price + ((1 - momentum) * amplitude * current_price);
          var min_next_price = current_price - (momentum * amplitude * current_price);
          break;
      }
	    // Stock prices go up or down...we'll pretend here that it's random (w/ the above momentum modifier)
      var next_price = Math.round(Math.floor(Math.random() * (max_next_price - min_next_price)) + min_next_price);
      // Don't exceed the limits
      next_price = (next_price > max_price) ? max_price : (next_price < min_price) ? min_price : next_price;
      // Now we put it in the array
      prices[time_now] = next_price;
      // And update the time so our loop isn't endless ;-)
      time_now = prices.length;
    }
    return prices;
	};
	
  var convertMinutesToTime = function (minutes) {
    return Math.floor((opens*60 + minutes)/60)+":"+formatLeadingZeroes(((opens*60 + minutes)%60),2);
  };

  var formatTrailingZeroes = function (n, places) {
    var nFloor = Math.floor(n);
    if ((n - nFloor) !== 0) {
      var nDecimal = ((n - nFloor) + "").split(".")[1].substring(0,places);
    }
    else {
      var nDecimal = "0";
    }
    while (nDecimal.length < places) {
      nDecimal = nDecimal + "0";
    }
    return nFloor + "." + nDecimal;
  };

  var formatLeadingZeroes = function (n, places) {
    var padded = n + "";
    while (padded.length < places) {
      padded = "0" + padded;
    }
    return padded;
  };

  var formatDecimal = function  (n, places) {
    return Math.round(n*Math.pow(10, places))/Math.pow(10, places);
  };

  var formatPercentage = function (number, places) {
    return formatDecimal(number*100, places) + "%";
  };

  var convertCentsToCurrency = function (value, name) {
    // default to dollars
    var name = name || "dollars";
    var currency = "$";
    // of course it might be something else...
    switch (name) {
      case "pounds":
        currency = "£";
        break;
      case "euros":
        currency = "€";
        break;
      case "yen":
        currency = "¥";
        break;
    }
  
    currency = currency + formatTrailingZeroes(formatDecimal((value/100),2),2);;
    return currency;
  };
  
  var getMaxProfit = function (prices) {
    var stock_prices = prices;
    // We need at least two prices; one to buy at and one to sell at
    if (stock_prices.length < 2) {
      throw 'The market was only open for a minute? What?';
    }
    // Initialize all the things!!
    var current_price = stock_prices[0];
    var min_price_minute = 0;
    var min_price = stock_prices[0];
    var max_price_minute = 0;
    var max_price = stock_prices[0];
    // Buying at opening and selling a minute later is by definition our initial potential profit
    var potential_profit = (stock_prices[1] - stock_prices[0])/stock_prices[0];;
    var max_profit = potential_profit;
    var buy_price = undefined;
    var buy_minute = undefined;
    var sell_price = undefined;
    var sell_minute = undefined;
    var range_count = 0;
    var profit_range = 0;

    // We start this loop on index 1 because we can't buy *and* sell in the opening minute, and 
    // the rules of our mental experiment state that we must make exactly "1 purchase and 1 sale"
    for (var this_minute = 1; this_minute < stock_prices.length; this_minute++) {
      
      current_price = stock_prices[this_minute];

      // Our profit if we bought at the lowest price and sold right now
      potential_profit = (current_price - min_price)/min_price;
  
      // The largest profit we've seen
      if (potential_profit >= max_profit) {
         max_profit = potential_profit;
         buy_price = min_price;
         buy_minute = min_price_minute;
         sell_price = current_price;
         sell_minute = this_minute;
         profit_range = range_count;
      }
      // The lowest price we've seen
      if (current_price < min_price) {
        min_price = current_price;
        min_price_minute = this_minute;
        range_count += 1;
      }
      // The highest price we've seen (this is just for our debug and is not strictly necessary)
      if (current_price >= max_price) {
        max_price = current_price;
        max_price_minute = this_minute;
      }
    }
    console.log("==============================================");
    // This is the price when the stock market opens
    console.log("Open: "+convertCentsToCurrency(stock_prices[0]));
    // This is the price when the stock market closes
    console.log("Close: "+convertCentsToCurrency(stock_prices[stock_prices.length-1]));
    // This is the lowest price all day
    console.log("Min: "+convertCentsToCurrency(min_price)+" @ "+convertMinutesToTime(min_price_minute));
    // This is the highest price all day
    console.log("Max: "+convertCentsToCurrency(max_price)+" @ "+convertMinutesToTime(max_price_minute));
    // This is the time to purchase the stock to maximize profit, assuming you will sell at the time below
    console.log("Buy: "+convertCentsToCurrency(buy_price)+" @ "+convertMinutesToTime(buy_minute));
    // This is the time to sell the stock to maximize profit, assuming you bought it at the time above 
    console.log("Sell: "+convertCentsToCurrency(sell_price)+" @ "+convertMinutesToTime(sell_minute));
    // This is the percentage profit
    console.log("Profit: "+formatPercentage(max_profit, 3));
    // This is the range in which the maximum profit was found...the local highest price is in this range.
    // It is not necessarily the highest price all day.
    console.log("Profit in Range: "+profit_range);
    // This is the total number of local ranges analyzed for potential maximum profit, the beginning of 
    // each is demarcated by a new lowest price at which one might buy the stock, and the end of each is
    // where the next begins. The maximum profit is not necessarily had by buying at the lowest price, 
    // which is why we analyze all the ranges.
    console.log("Total Range Count: "+range_count);
    console.log("==============================================");

    return max_profit;
  }
  stock.prices = populatePrices(amp, mom);
  stock.max_profit = getMaxProfit(stock.prices);
  return stock;
};

// Take it for a test drive
// Starting Price: $100, Amplitude: 0.025, Momentum: 0.85
var the_stock = mockStock(10000,0.025,0.85);
