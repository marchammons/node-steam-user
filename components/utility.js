var SteamUser = require('../index.js');
var ByteBuffer = require('bytebuffer');

SteamUser.formatCurrency = function(amount, currency) {
	amount = amount.toFixed(2);

	if(!SteamUser.CurrencyData[currency]) {
		return amount;
	}

	var data = SteamUser.CurrencyData[currency];

	if(data.whole) {
		amount = amount.replace('.00', '');
	}

	if(data.commas) {
		amount = amount.replace('.', ',');
	}

	return (data.prepend || '') + amount + (data.append || '');
};

SteamUser.generateAuthCode = function(secret, timeOffset) {
	timeOffset = timeOffset || 0;

	var buffer = new ByteBuffer(8, ByteBuffer.LITTLE_ENDIAN);
	buffer.writeUint64(Math.floor((Math.floor(Date.now() / 1000) + timeOffset) / 30));
	buffer.flip().reverse();

	var hmac = require('crypto').createHmac('sha1', secret);
	hmac = hmac.update(buffer.toBuffer()).digest();

	var start = hmac[19] & 0x0F;
	hmac = ByteBuffer.wrap(hmac.slice(start, start + 4), ByteBuffer.BIG_ENDIAN);

	var fullcode = hmac.readUint32() & 0x7fffffff;

	var chars = '23456789BCDFGHJKMNPQRTVWXY';

	var code = '';
	for(i = 0; i < 5; i++) {
		code += chars.charAt(fullcode % chars.length);
		fullcode /= chars.length;
	}

	return code;
};
