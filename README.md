# このリポジトリについて
このリポジトリは簡単に家計簿をつけることを目指したAlexaのスキル「らくらく家計簿」のコードを管理しています。らくらく家計簿には以下の3つの機能を用意しています。

- 家計簿に新しい支出を記録する
- 記録した支出を確認する
- 月別のレポートをLineに送信してもらう

社内のハッカソンで1日ちょっとで作ったものなのでスピード重視のため品質・保守性は低いです（笑）ご了承ください。

# 使い方

## 事前準備
このスキルは公に公開しているものではないので、自分でAWS Developersに登録のうえデプロイして利用する必要があります。

デプロイの前にまず必要なnpmパッケージをインストールします。

```sh
cd lambda/custom
npm i
```

次に、このリポジトリに含まれない以下の2ファイルを用意します。AWSアカウントにはレポート用htmlを吐き出すためのS3バケットを用意して置く必要があります。また、Lineへの通知はLine Messaging APIを使うため、Line Developersに登録してLine Botを作る必要があります。

```js
module.exports = {
  "accessKeyId": "AWSアカウントのアクセスキーID",
  "secretAccessKey": "AWSアカウントのアクセスキー",
  "region": "接続先リージョン"
}
```

```js
module.exports = {
  lineUserId: 'レポート送信先のLineユーザID',
  lineChannelAccessToken: 'Line Developersで取得できるアクセストークン（Line Developersに登録する必要があります）'
}
```

## スキルの呼び出し
Alexaスキルのデプロイが完了したら、以下のように話しかけることでスキルを呼び出せます。

- Alexa、「らくらく家計簿」を開いて
- Alexa、「らくらく家計簿」で○○

2つ目の例では後述する各機能の呼び出しを「○○」の部分に含めることができます。

## 支出の追加
スキルを呼び出したら支出を追加できます。

- 今日食費で千円使ったよ
- 今日交通費で五百円使ったよ

## 支出の確認
支出の確認は以下のようにします

- 7/1の食費を知りたい
- 昨日の交通費はどうだった

## レポートの送信
登録した支出をグラフにしたものをLineに通知してくれます。

- 今月のレポートを送って
- 8月のレポートが見たい

月ごとのレポートのみです。「今日のレポートを送って」と言った場合も今月のものが届きます...（笑）