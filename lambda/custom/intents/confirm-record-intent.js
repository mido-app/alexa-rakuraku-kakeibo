const genre = require('../constants/genre')

module.exports = {

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ConfirmRecordIntent';
    },
    async handle(handlerInput) {
        const attr = await handlerInput.attributesManager.getPersistentAttributes();
        const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
        const genre = handlerInput.requestEnvelope.request.intent.slots.genre.value;
        console.log(`gernre:${genre}`)
        // const amount = handlerInput.requestEnvelope.request.intent.slots.amount.value;
        attr.incomeHistory.push({
            date: '2019-07-01',
            genre: 1,
            amount: 1000
        })
        let amountSum = 0
        console.log(`genre:${attr.paymentHistory.slice(-1)[0].genre}`)
        for (var i = 0; i < attr.incomeHistory.length; i++) {
            //対象データへのアクセスは data[i] の様な形式
            if (attr.incomeHistory[i].genre === genre)//今言ったやつほしい
                amountSum += attr.incomeHistory[i].amount
            console.log(`amountSum:${amountSum}`)
        }

        // if (attr.value) {
        //     speechText += `前回の ${attr.value}円に加算しますね。`;
        // }
        //attr.value = value;
        //console.log(attr)
        handlerInput.attributesManager.setPersistentAttributes(attr);
        await handlerInput.attributesManager.savePersistentAttributes();

        const response = this.createResponse({
            date: date,
            genre: genre,
            amountSum: amountSum
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
        return `${input.date}に${input.genre}で${input.amountSum}円ですね。`
    }
};
