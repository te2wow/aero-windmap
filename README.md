# Kazelog - 空港風向き・風速情報アプリ

日本の主要空港の風向き・風速をリアルタイムで表示するWebアプリケーションです。気象庁のAMeDAS（地域気象観測システム）データを活用して、視覚的に風の情報を提供します。

## 機能概要

- **インタラクティブ地図**: 日本の主要15空港をLeaflet地図上に表示
- **風向き・風速表示**: コンパス形式で風向きと風速を視覚化
- **リアルタイムデータ**: 気象庁AMeDASの最新観測データを取得
- **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応

## 技術スタック

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Hono (API Routes)
- **地図**: Leaflet
- **データソース**: 気象庁 AMeDAS API
- **パッケージマネージャー**: pnpm

## 対象空港

以下の15の主要空港をサポートしています：

| 空港名 | IATA | ICAO | AMeDAS観測所 |
|--------|------|------|-------------|
| 羽田空港 | HND | RJTT | 44132 |
| 成田国際空港 | NRT | RJAA | 44141 |
| 関西国際空港 | KIX | RJBB | 62078 |
| 大阪国際空港（伊丹） | ITM | RJOO | 62051 |
| 中部国際空港 | NGO | RJGG | 51106 |
| 福岡空港 | FUK | RJFF | 82182 |
| 新千歳空港 | CTS | RJCC | 14163 |
| 仙台空港 | SDJ | RJSS | 34392 |
| 那覇空港 | OKA | ROAH | 91107 |
| 鹿児島空港 | KOJ | RJFK | 88317 |
| 広島空港 | HIJ | RJOA | 71106 |
| 岡山空港 | OKJ | RJOB | 66106 |
| 松山空港 | MYJ | RJOM | 72306 |
| 高知空港 | KCZ | RJOK | 74106 |
| 徳島空港 | TKS | RJOS | 73106 |

## 気象庁API仕様

### 概要

気象庁では、AMeDAS（Automated Meteorological Data Acquisition System）による気象観測データをJSON形式で提供しています。このアプリケーションでは、以下のAPIエンドポイントを使用しています。

### APIエンドポイント

#### 1. 最新観測時刻取得
```
GET https://www.jma.go.jp/bosai/amedas/data/latest_time.txt
```

**レスポンス例:**
```
202507061200
```

観測データの最新タイムスタンプ（YYYYMMDDHHmm形式）を返します。

#### 2. AMeDAS観測データ取得
```
GET https://www.jma.go.jp/bosai/amedas/data/map/{timestamp}00.json
```

**パラメータ:**
- `timestamp`: 観測時刻（YYYYMMDDHHmm形式）

**レスポンス例:**
```json
{
  "44132": {
    "temp": [25.5, 0],
    "wind": [8.2, 0],
    "windDirection": [270, 0],
    "humidity": [65, 0],
    "precipitation1h": [0, 0]
  }
}
```

#### 3. 観測所情報取得
```
GET https://www.jma.go.jp/bosai/amedas/const/amedastable.json
```

**レスポンス例:**
```json
{
  "44132": {
    "type": "A",
    "elems": "11111111",
    "lat": [35, 32.9],
    "lon": [139, 46.8],
    "kjName": "東京"
  }
}
```

### データ形式仕様

#### 観測データの構造

各観測項目は配列形式で提供され、以下の構造を持ちます：
```
[観測値, 品質フラグ]
```

**主な観測項目:**
- `temp`: 気温（℃）
- `wind`: 風速（m/s）
- `windDirection`: 風向（度）- 気象学的風向（風が吹いてくる方向）
- `humidity`: 湿度（%）
- `precipitation1h`: 1時間降水量（mm）
- `precipitation10m`: 10分間降水量（mm）
- `pressure`: 気圧（hPa）
- `sun1h`: 1時間日照時間（時間）
- `visibility`: 視程（km）

**品質フラグ:**
- `0`: 正常値
- `1`: 準正常値
- `4`: 欠測
- `8`: 疑問値

#### 風向の表現

気象庁の風向データは「気象学的風向」で表現されており、風が吹いてくる方向を示します：
- `0°` または `360°`: 北風（北から南へ）
- `90°`: 東風（東から西へ）
- `180°`: 南風（南から北へ）
- `270°`: 西風（西から東へ）

### 利用制限・注意事項

1. **利用規約**: 政府標準利用規約に基づき、出典の明示により利用可能
2. **更新頻度**: 10分間隔で更新
3. **データ保持期間**: 最新から約2週間分のデータが利用可能
4. **アクセス制限**: 過度なアクセスは控える（推奨：10分間隔以上）

## アーキテクチャ

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Hono API)    │◄──►│   (JMA API)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
│ - React Components   │ - API Routes        │ - AMeDAS Data
│ - Leaflet Map        │ - Error Handling    │ - Station Info
│ - Wind Compass       │ - Data Proxy        │ - Latest Time
│ - Responsive Design  │ - CORS Handling     │
└─────────────────────┘ └─────────────────────┘ └─────────────────┘
```

### APIルート構成

```
/api/weather/                 # 最新観測時刻取得
/api/weather/amedas/[timestamp]  # 指定時刻の観測データ取得  
/api/weather/stations/        # 観測所情報取得
```

### データフロー

1. **初期化**: アプリ起動時に羽田空港をデフォルト選択
2. **最新時刻取得**: 気象庁APIから最新の観測時刻を取得
3. **観測データ取得**: 指定時刻のAMeDASデータを取得
4. **データ抽出**: 選択された空港のAMeDAS観測所データを抽出
5. **UI更新**: 風向きコンパスと空港情報を更新

## セットアップ・実行方法

### 前提条件

- Node.js 18以上
- pnpm 9以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/te2wow/kazelog.git
cd kazelog

# 依存関係のインストール
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

### ビルド・本番実行

```bash
# ビルド
pnpm build

# 本番サーバー起動
pnpm start
```

## 開発情報

### プロジェクト構造

```
kazelog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes (Hono)
│   │   ├── globals.css     # グローバルスタイル
│   │   ├── layout.tsx      # レイアウトコンポーネント
│   │   └── page.tsx        # メインページ
│   ├── components/         # Reactコンポーネント
│   │   ├── MapComponent.tsx    # 地図コンポーネント
│   │   └── WindCompass.tsx     # 風向きコンパス
│   ├── data/              # 静的データ
│   │   └── airports.json  # 空港データ
│   └── types/             # TypeScript型定義
│       └── airport.ts     # 空港・気象データ型
├── public/                # 静的ファイル
├── package.json          # 依存関係設定
└── README.md            # このファイル
```

### 型定義

#### Airport型
```typescript
interface Airport {
  id: string
  name: string           // 日本語名
  nameEn: string        // 英語名
  iataCode: string      // IATA空港コード
  icaoCode: string      // ICAO空港コード
  latitude: number      // 緯度
  longitude: number     // 経度
  amedasStation: string // 対応AMeDAS観測所ID
}
```

#### WeatherData型
```typescript
interface WeatherData {
  temp?: [number, number]              // 気温
  humidity?: [number, number]          // 湿度
  wind?: [number, number]              // 風速
  windDirection?: [number, number]     // 風向
  precipitation1h?: [number, number]   // 1時間降水量
  // その他の観測項目...
}
```

### 主要コンポーネント

#### MapComponent
- Leafletを使用した地図表示
- 空港マーカーの配置とクリックイベント処理
- 動的インポートによるSSR問題の回避

#### WindCompass
- SVG風のCSS描画によるコンパス表示
- 風向きの矢印アニメーション
- 方角テキストの日本語表示

## トラブルシューティング

### よくある問題

#### 1. 地図が表示されない
- ブラウザの開発者ツールでエラーを確認
- Leaflet CSSが正しく読み込まれているか確認
- ネットワーク接続を確認

#### 2. 風データが表示されない
- 気象庁APIのアクセス制限に該当していないか確認
- 選択した空港のAMeDAS観測所が風観測を行っているか確認
- APIレスポンスを開発者ツールで確認

#### 3. マップの初期化エラー
- ページをリフレッシュして再試行
- 別のブラウザで確認
- キャッシュのクリア

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 注意事項

- 気象庁データの利用にあたっては、政府標準利用規約を遵守してください
- 商用利用の場合は、適切な出典表示を行ってください
- APIへの過度なアクセスは控え、適切な間隔でのアクセスを心がけてください

## 今後の改善予定

- [ ] 風速の強弱に応じた矢印の色分け
- [ ] 過去データの表示機能
- [ ] 気温・湿度などの追加表示
- [ ] お気に入り空港の保存機能
- [ ] PWA対応

---

**開発者**: Claude Code  
**最終更新**: 2025年7月6日