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
    if (attr.value) {
        speechText += `前回の ${attr.value}円に加算しますね。`;
    }
    attr.value = value;
    console.log(attr)
    handlerInput.attributesManager.setPersistentAttributes(attr);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};
