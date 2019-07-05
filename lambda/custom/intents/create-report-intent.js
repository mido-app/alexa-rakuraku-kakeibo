const moment = require('moment')
const genre = require('../constants/genre')
const request = require('request-promise')
const lineSetting = require('../line-setting')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const uuidv4 = require('uuid/v4')

module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CreateReportIntent'
  },
  async handle(handlerInput) {
    let date = handlerInput.requestEnvelope.request.intent.slots.date.value

    let attr = await handlerInput.attributesManager.getPersistentAttributes()
    console.log(attr)

    const response = await this.createResponse({
      date: date
    }, attr)

    handlerInput.attributesManager.setPersistentAttributes(attr);
    await handlerInput.attributesManager.savePersistentAttributes()

    return handlerInput.responseBuilder
      .speak(response)
      // .withShouldEndSession(false)
      .getResponse();
  },
  async createResponse(input, attr) {
    // 何月のレポートが欲しいか求める
    const targetMonth = moment(input.date).format('YYYY-MM')
    console.log(`target month: ${targetMonth}`)

    // 永続化セッションから対象の月の収入データを取得
    let paymentHistory = attr.paymentHistory
      .map(history => ({
        month: moment(history.date).format('YYYY-MM'),
        genre: history.genre,
        amount: history.amount
      }))
      .filter(history => history.month === targetMonth)
    console.dir(paymentHistory)

    // 集計
    let amountGroupByGenre = {}
    paymentHistory.forEach(history => {
      let genreValue = amountGroupByGenre[history.genre]
      if(!genreValue) genreValue = 0
      amountGroupByGenre[history.genre] = genreValue + history.amount
      console.log(`date=${history.date}, genre=${history.genre}, amount=${history.amount}`)
    })
    console.log(amountGroupByGenre)

    // htmlを作る
    console.log(`path: ${path.resolve(__dirname, '../ejs/graph.ejs')}`)
    const template = fs.readFileSync(path.resolve(__dirname, '../ejs/graph.ejs'), {encoding: "utf-8"})
    const data = {
      data: JSON.stringify(Object.keys(amountGroupByGenre).map(key => amountGroupByGenre[key])),
      backgroundColor: JSON.stringify(Object.keys(amountGroupByGenre).map(key => genre.getColorByValue(Number(key)))),
      labels: JSON.stringify(Object.keys(amountGroupByGenre).map(key => genre.getWordsByValue(Number(key))[0]))
    }
    console.dir(data)
    const html = ejs.render(template, data)
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
            type: 'template',
            altText: `${moment(input.date).format('YYYY年MM月')}のレポートです`,
            template: {
              type: 'buttons',
              text: `${moment(input.date).format('YYYY年MM月')}のレポートです`,
              actions: [
                {
                  type: 'uri',
                  label: 'タップしてレポートを表示',
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
    const dateJP = moment(input.date).format('YYYY年MM月')
    return `${dateJP}のレポートをLineに送信しました。`
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
          Key: `report-${uuidv4()}.html`,
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
