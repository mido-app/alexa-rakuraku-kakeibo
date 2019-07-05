const moment = require('moment')
const genre = require('../constants/genre')
const request = require('request-promise')
const lineSetting = require('../line-setting')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path');

module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CreateReportIntent';
  },
  async handle(handlerInput) {
    let date = handlerInput.requestEnvelope.request.intent.slots.date.value;
    let graphType = handlerInput.requestEnvelope.request.intent.slots.graphType.value;

    let attr = await handlerInput.attributesManager.getPersistentAttributes()
    console.log(attr)

    const response = await this.createResponse({
      date: date,
      graphType: graphType
    }, attr)

    handlerInput.attributesManager.setPersistentAttributes(attr);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(response)
      // .withShouldEndSession(false)
      .getResponse();
  },
  async createResponse(input, attr) {
    // バリデーション
    let errorResponse = null
    if (!input.date) {
      errorResponse = '何月のレポートが欲しいですか？'
    } else if (!input.graphType) {
      errorResponse = '円グラフと棒グラフ、どちらでレポートを作成しますか？'
    }

    // 指定されない場合はエラーメッセージを返却
    if (errorResponse) {
      return errorResponse
    }

    // 何月のレポートが欲しいか求める
    const targetMonth = moment(input.date).format('YYYY-MM')

    // 永続化セッションから対象の月の収入データを取得
    let incomeHistory = attr.incomeHistory
      .map(history => ({
        month: moment(history.date).format('YYYY-MM'),
        genre: history.genre,
        amount: history.amount
      }))
      .filter(history => history.month === targetMonth)

    // 集計
    let amountGroupByGenre = {}
    incomeHistory.forEach(history => {
      let genreValue = amountGroupByGenre[history.genre]
      if(!genreValue) genreValue = 0
      amountGroupByGenre[history.genre] = genreValue + history.amount
    })
    console.log(amountGroupByGenre)

    // htmlを作る
    console.log(`path: ${path.resolve(__dirname, '../ejs/graph.ejs')}`)
    const template = fs.readFileSync(path.resolve(__dirname, '../ejs/graph.ejs'), {encoding: "utf-8"})
    const html = ejs.render(template, {})
    console.log(html)

    // s3にファイルをあげてURL取得
    let url = await this.upload(html)

    // 集計結果をLineにメッセージ
    await request({
      method: 'POST',
      uri: 'https://api.line.me/v2/bot/message/push',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lineSetting.lineChannelAccessToken}`
      },
      body: {
        to: lineSetting.lineUserId,
        messages: [
          {
            type: 'text',
            text: 'Hello, Line Bot!'
          },
          {
            type: 'template',
            altText: '代替テキスト',
            template: {
              type: 'buttons',
              text: `${moment(input.date).format('YYYY年MM月')}のレポートです`,
              actions: [
                {
                  type: 'uri',
                  label: 'ラベル',
                  uri: url
                }
              ]
            }
          }
        ]
      },
      json: true
    })

    // おうむ返し
    const dateJP = moment(input.date).format('YYYY年MM月DD日')
    return `${dateJP}のレポートを${input.graphType}でLineに送信しました。`
  },
  upload(htmlbody) {
    return new Promise((resolve, reject) => {
      // ファイルストリームを作る
      try {
        let stream = Buffer.from(htmlbody, 'utf-8')
        
        const AWS = require('aws-sdk')
        const awsSetting = require('../aws-setting')
        AWS.config.update(awsSetting)

        // s3にデータを置く
        const s3 = new AWS.S3()
        s3.upload({
          ACL: 'public-read',
          Bucket: 'alexa-rakuraku-kakeibo-graph',
          Key: 'sample.html',
          Body: stream,
          ContentType: 'text/html'
        }, function (err, data) {
          if (err) {
            console.log('upload file failed!')
            console.error(err)
            throw err
          } else {
            console.log(`upload file success! : ${data.Location}`)
            resolve(data.Location)
          }
        })
      } catch (e) {
        console.error(e)
        console.error(e.stack)
        reject(e)
      }
    })
  }
};
