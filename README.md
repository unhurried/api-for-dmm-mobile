## API for DMM Mobile

Node.jsからGoogle Chrome（Chromium）を操作できる [puppeteer](https://github.com/GoogleChrome/puppeteer)を使ったスプレイピングを試す目的で開発しました。

[DMM Mobile](https://mvno.dmm.com/)のマイページを操作することで以下の機能をAPI化しています。

* 高速通信容量残高の取得
* 通信モード（高速・低速）の取得
* 通信モード（高速・低速）の切り替え

※ このプロジェクトはあくまでpuppeteerでのスクレイピングのサンプルコードとして公開しています。実行する際にはサービスの最新の利用規約に従ってください。

### 実行方法

1. 依存ライブラリをインストールする

```shell
$ npm install
```

2. APIサーバーを起動する

```shell
# 環境変数PORTもしくは3000番ポートでサーバーが起動する
$ node app.js
```

3. リクエストを送信する


```shell
curl -X POST \
  http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{"loginId" : "***", "password" : "***"}'
```

### API仕様

##### リクエスト

* HTTPメソッド：`POST`
* Content-Type：`application/json`
* ボディ

```json
{
    "loginId": "ログインID (必須)",
    "password": "パスワード (必須)",
    "highSpeedStatus": "on もしくは off (高速通信モードを変更する場合に指定)"    
}
```

##### レスポンス

###### 成功時

* HTTPステータスコード：`200`
* Content-Type：`application/json`
* ボディ

```json
{
    "highSppedStatus": "現在の高速通信モード (on もしくは off)",
    "remainingDataBalance": "高速通信容量残高 (例：3,000MB)"
}
```

###### 失敗時

- HTTPステータスコード：`400` もしくは `500`
- Content-Type：`application/json`
- ボディ

```json
{
    "error": "エラーコード"
}
```