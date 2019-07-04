module.exports = {
    canHandle(handlerInput) {
        console.log('test2')
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ConfirmRecordIntent';
    },
    handle(handlerInput) {
        //const amount = handlerInput.requestEnvelope.request.intent.slots.amount.value;
        const genre = handlerInput.requestEnvelope.request.intent.slots.genre.value
        const date = handlerInput.requestEnvelope.request.intent.slots.date.value
        const speechText = `${genre}ですね。`;
        console.log(genre)
        const response = this.createResponse({
            date: date,
            genre: genre
        })
        return handlerInput.responseBuilder
            .speak(response)
            // .withSimpleCard('Hello World', speechText)
            .getResponse();

    },
    createResponse(input) {
        // バリデーション
        let errorResponse = null
        if (!input.date) {
            errorResponse = `いつの${input.genre}が欲しいですか？`
        } else if (!input.genre) {
            errorResponse = `${input.date}のどのジャンルがほしいですか？`
        }

        // 指定されない場合はエラーメッセージを返却
        if (errorResponse) {
            return errorResponse
        }

        // おうむ返し
        return `${input.date}のレポートを${input.genre}でLineに送信しました。`
    }
};
