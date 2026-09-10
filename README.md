# nouch LP

学習課題として制作した架空ブランド「nouch」のランディングページ。

## 構成

GitHub Pages に上げやすいよう、**全ファイルを同じ階層**に置いています。

```
index.html   ページ本体
style.css
script.js
*.jpg / *.png   写真・ポスター画像・商品カット（透過PNG）
*.mp4           動画4本ぶん（水は SOLUTION と最終CTA で同じファイルを使用）
```

外部ライブラリなし。**HTML / CSS / JavaScript のみ。**
フォントだけ Google Fonts（Zen Kaku Gothic New / Outfit / DM Sans）を読み込んでいます。

## GitHub Pages で公開する

1. GitHub で新しいリポジトリを作る（Public）
2. このフォルダの中身を**まるごと**アップロード（`index.html` がいちばん上に来るように）
3. リポジトリの **Settings → Pages**
4. Source を **Deploy from a branch**、Branch を **main / (root)** にして Save
5. 1〜2分で `https://<ユーザー名>.github.io/<リポジトリ名>/` が開く

## Google タグマネージャー

`index.html` の `GTM-XXXXXXX` を自分のコンテナIDに置き換えてください。2か所あります（`<head>` と `<body>` の直後）。

計測しているイベント（dataLayer に push）:

| イベント名 | 内容 |
|---|---|
| `cta_click` | CTAボタンのクリック。`cta_position` に位置（header / fv / product / growth / final） |
| `select_color` | カラーを切り替えた。`color` に mist / sand / clay |
| `view_fit_switch` | 交換の図が画面に入った |
| `faq_open` | FAQを開いた。`question` に質問文 |
| `scroll_depth` | 25 / 50 / 75 / 100% 到達 |

GA4 側では、GTMで「カスタムイベント」トリガーを作って GA4イベントタグに紐づけます。

## 実装のメモ

- **SPファースト。** 375pxで組んで、768px以上でPC（最大1120px）に切り替え
- **動画は3本とも `autoplay muted loop playsinline`。** iOSで自動再生させるには `muted` と `playsinline` の両方が必要
- 画面外の動画は `IntersectionObserver` で一時停止。スマホの電池を無駄にしない
- **交換の図（Fit切替）はSVG + CSSアニメーション。** 動画ではないので軽く、あとから色や速度を変えられる。画面に入ったとき1回だけ再生
- `prefers-reduced-motion` に対応。動きを減らす設定の人にはアニメーションを出さない
- カラー見本は画像の差し替え。次の画像を読み込んでから切り替えるので、途中で白く抜けない

## 色

| | |
|---|---|
| Mist | `#485F60` |
| Sand | `#5E554E` |
| Clay | `#604947` |
| Accent | `#2F5D63` |
| Accent Deep | `#22474C` |
| Accent Light（暗い背景用） | `#8FB8BC` |
| Ink | `#1A1918` |
| Ink Muted | `#6E6863` |
| Paper | `#F7F6F4` |
| Line | `#E6E4E1` |
| Deep | `#141516` |

暗い面の文字は、グレーの色番号ではなく**白の不透明度**で濃淡をつけています（見出し100% / 本文78% / 補足55〜60%）。背景がどんな色でも破綻しないため。

## 未確定のところ

- CTAのリンク先（カート・購入フローは未実装。`href="#"`）
- フッターの各ページ（特定商取引法、プライバシーポリシー、お問い合わせ）
- 比較表の価格は各社公表情報にもとづく参考値（2026年9月時点）
- VOICEの3件は制作例。実在する購入者の声ではない旨をページ内に明記
