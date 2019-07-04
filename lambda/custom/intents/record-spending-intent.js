module.exports  = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RecordSpendingIntent';
  },
  handle(handlerInput) {
    const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
    const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
    const genre = handlerInput.requestEnvelope.request.intent.slots.genre.value;
    const value = handlerInput.requestEnvelope.request.intent.slots.value.value;
    const speechText = `${date}に${genre}で${value}円ですね。`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};
