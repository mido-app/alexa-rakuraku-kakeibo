const moment = require('moment')
const genreModule = require('../constants/genre')

module.exports  = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RecordSpendingIntent';
  },
  async handle(handlerInput) {
    const attr = await handlerInput.attributesManager.getPersistentAttributes();
    const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
    const genre = handlerInput.requestEnvelope.request.intent.slots.genre.value;
    const value = handlerInput.requestEnvelope.request.intent.slots.value.value;
    var speechText = `${date}に${genre}で${value}円ですね。`;
    attr.paymentHistory.push({
        date: moment(date).format('YYYY-MM-DD'),
        genre: genreModule.getValueByWord(genre) ,
        amount: value,
    })
    console.log(`登録日時: ${attr.paymentHistory.slice(-1)[0].date}`);
    console.log(`登録ジャンルナンバー: ${attr.paymentHistory.slice(-1)[0].genre}`);
    console.log(`登録支払い料金: ${attr.paymentHistory.slice(-1)[0].amount}`);
    handlerInput.attributesManager.setPersistentAttributes(attr);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};
