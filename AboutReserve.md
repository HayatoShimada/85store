# Reserve(予約)ページの作成

## 概要

85-StoreのReserve(予約)について分かるページを作りたい  
予約の空き状況と、それぞれの店舗の説明、基本情報、インラインの予約ができるようにしたい。

## 基本情報

- 営業時間は12:00 ~ 18:00
- 1st Floorのみ事前予約で11:00 ~ 20:00まで延長営業可
- Limited Storeは3/1までの仮店舗

## 予約機能

- Limited Storeの予約・空き情報確認(Google Calendar連携)
    - About: https://85-store.com/blog/limitedstore
    - https://calendar.app.google/oFsPPYZUiPXDtZSB7
- 1st Floor(85-Store)の予約・確認(Google Calendar連携)
    - About: https://85-store.com/about
    - https://calendar.app.google/MJkz1WnXuv7JoN6B9
- 2nd Floor(85-UpStore)の予約・確認(Google Calendar連携)
    - About: https://85-store.com/upstore
    - https://calendar.app.google/uaU1rBEzcqVUTQkA6
- 開催イベントはブログblogs, categoryフィールドが"Event1st", "Event2nd"のブログカードコンポーネントで確認

## スケジュール確認

- Limited Storeの営業スケジュール確認
- 1st Floorの営業スケジュール確認
- 2nd Floorの営業スケジュール確認

## コンポーネント要素
- 画像（2秒ごとにフェードイン）複数枚
- タイトル
- 説明
- 予約ページボタン
- 詳細ページボタン
- イベント一覧（Event1st, Event2nd blogs, category)
- 埋め込み

## 埋め込み

### 1stFloor
```
<!-- Google Calendar Appointment Scheduling begin -->
<iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2JUkgse1YjUHHZxq77oo9ePtjpwItHH0OHtG5s-BODbPRxY8b74zfH4ofAaFwZi7PyU4FQ1u0J?gv=true" style="border: 0" width="100%" height="600" frameborder="0"></iframe>
<!-- end Google Calendar Appointment Scheduling -->
```

### 2ndFloor
```
<!-- Google Calendar Appointment Scheduling begin -->
<iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2JUkgse1YjUHHZxq77oo9ePtjpwItHH0OHtG5s-BODbPRxY8b74zfH4ofAaFwZi7PyU4FQ1u0J?gv=true" style="border: 0" width="100%" height="600" frameborder="0"></iframe>
<!-- end Google Calendar Appointment Scheduling -->
```

### LimitedStore
```
<!-- Google Calendar Appointment Scheduling begin -->
<iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ05-VrhHdbdc_WLtoZiijEV-yVeaXDpfYCQVKXn4DTkjMG_D0eKowifeNSTWFlZbtDQ1J6MDjmO?gv=true" style="border: 0" width="100%" height="600" frameborder="0"></iframe>
<!-- end Google Calendar Appointment Scheduling -->
```
