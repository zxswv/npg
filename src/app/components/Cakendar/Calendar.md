# DayPicker を構成する要素

https://daypicker.dev/docs/anatomy

```bash
    Navigation Bar
    ナビゲーションバー : 月の間にナビゲートする矢印が含まれています。

    Month Caption
    月キャプション : 現在の月のタイトルを表示します。

    Weekdays Row
    平日列 : 平日の名前が表示されます。

    Weeks
    週 : 月の曜日を表示する行。

    Day
    日: 月の日を表します。これは、次のような異なる修飾子を持つことができます。
       - selected : 日が決まりました。
       - disabled : 当日は無効です。
       - today : 今日は今日。
       - outside : 当日は、現在の月の外です。

    Footer
    フッター : 選択した日付をアナウンスするために使用される ARIA のライブリージョン。
```
