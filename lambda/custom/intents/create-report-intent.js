const moment = require('moment')
const genre = require('../constants/genre')

module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CreateReportIntent';
  },
  handle(handlerInput) {
    let date = handlerInput.requestEnvelope.request.intent.slots.date.value;
    let graphType = handlerInput.requestEnvelope.request.intent.slots.graphType.value;

    const response = this.createResponse({
      date: date,
      graphType: graphType
    })

    return handlerInput.responseBuilder
      .speak(response)
      // .withShouldEndSession(false)
      .getResponse();
  },
  createResponse(input) {
    // バリデーション
    let errorResponse = null
    if (!input.date) {
      errorResponse = 'いつのレポートが欲しいですか？'
    } else if (!input.graphType) {
      errorResponse = '円グラフと棒グラフ、どちらでレポートを作成しますか？'
    }

    // 指定されない場合はエラーメッセージを返却
    if (errorResponse) {
      return errorResponse
    }

    // おうむ返し
    const dateJP = moment(input.date).format('YYYY年MM月DD日')
    return `${dateJP}のレポートを${input.graphType}でLineに送信しました。`
  }
};
