export type GlossaryTerm = {
  slug: string
  title: string
  reading: string
  shortDef: string
  description: string[]
  category: string
  relatedGenre: string | null  // /games?genre=xxx へのリンク用
  relatedGenreLabel: string | null
  relatedSlugs: string[]
  keywords: string[]
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: 'worker-placement',
    title: 'ワーカープレイスメント',
    reading: 'わーかーぷれいすめんと',
    shortDef: 'コマをボードに置いてアクションを実行するシステム',
    description: [
      'ワーカープレイスメント（Worker Placement）とは、プレイヤーが自分の「ワーカー（コマ）」をボード上のアクションスペースに置き、そのスペースに対応した効果を得るゲームシステムです。',
      '最大の特徴は「先に置いたもの勝ち」というルール。他のプレイヤーにスペースを先取りされると、自分がやりたいアクションができなくなるため、計画性と相手の動きを読む力が重要になります。',
      '「アグリコラ」や「ワーカープレイスメント系」と呼ばれるゲームは総じてこのシステムを採用しており、重量級の戦略ゲームによく見られます。限られたワーカーをどこに置くか——その決断がゲームの面白さの核心です。',
    ],
    category: '戦略',
    relatedGenre: 'strategy',
    relatedGenreLabel: '戦略ゲーム',
    relatedSlugs: ['deck-building', 'area-majority', 'euro-game'],
    keywords: ['ワーカープレイスメント とは', 'ワーカープレイスメント 意味', 'ワーカープレイスメント ボードゲーム'],
  },
  {
    slug: 'deck-building',
    title: 'デッキ構築',
    reading: 'でっきこうちく',
    shortDef: 'ゲーム中にカードを獲得してデッキを強化するシステム',
    description: [
      'デッキ構築（Deck Building）とは、ゲームが進むにつれてカードを購入・獲得し、自分だけのデッキ（カードの山）を作り上げていくシステムです。',
      'スタート時は全員が同じ弱いカードセットを持ちます。ゲームを通じてより強力なカードを入手し、デッキを洗練させることで、後半にかけてどんどん強力なコンボが生まれていく爽快感が魅力です。',
      '「ドミニオン」が2008年にこのシステムを確立し、今やボードゲーム界を代表するメカニクスの一つになりました。デッキの中身を管理し、不要なカードを減らしながら強いシナジーを目指すパズル的な楽しさがあります。',
    ],
    category: 'カードゲーム',
    relatedGenre: 'deck_building',
    relatedGenreLabel: 'デッキ構築ゲーム',
    relatedSlugs: ['draft', 'worker-placement', 'euro-game'],
    keywords: ['デッキ構築 とは', 'デッキ構築 ボードゲーム 意味', 'デッキ構築 おすすめ'],
  },
  {
    slug: 'draft',
    title: 'ドラフト',
    reading: 'どらふと',
    shortDef: '複数の選択肢から1つ選び次へ回すカード選択方式',
    description: [
      'ドラフト（Draft）とは、複数のカードや選択肢の中から1枚だけ選んで手元に加え、残りを隣のプレイヤーへ回すことを繰り返すシステムです。野球のドラフト会議と同じ考え方です。',
      '全員が同じ手札を起点に選択を繰り返すため、運だけに依存せず「何を選ぶか」「何を相手に渡すか」という駆け引きが生まれます。自分が欲しいカードを取りながら、相手に有利なカードを渡さない読み合いが白熱します。',
      '「7 Wonders」「ウィングスパン」など人気タイトルにも採用されており、複数プレイヤーで全員が同時に楽しめるテンポの良さが特徴です。',
    ],
    category: 'カードゲーム',
    relatedGenre: 'drafting',
    relatedGenreLabel: 'ドラフトゲーム',
    relatedSlugs: ['deck-building', 'worker-placement', 'cooperative-game'],
    keywords: ['ドラフト ボードゲーム とは', 'ドラフト カードゲーム 意味', 'ドラフト 方式 ゲーム'],
  },
  {
    slug: 'meeple',
    title: 'ミープル',
    reading: 'みーぷる',
    shortDef: 'ボードゲームで使われる人型コマの総称',
    description: [
      'ミープル（Meeple）とは、ボードゲームで使われる人型のコマのことです。「My People（マイ・ピープル）」が縮まって「Meeple」になったとされています。',
      'もともとは「カルカソンヌ」というゲームで使われた駒が起源で、そのシンプルながら愛らしい人型のデザインが世界中のプレイヤーに愛されました。現在ではボードゲーム全般のコマを指す汎用語として使われています。',
      'ミープルはボードゲーム文化のシンボル的存在になっており、ゲームショップのロゴやボードゲームカフェの看板など、様々なところで見かけます。大きさ・素材・色のバリエーションも豊富で、コレクターも多い存在です。',
    ],
    category: 'コンポーネント',
    relatedGenre: null,
    relatedGenreLabel: null,
    relatedSlugs: ['worker-placement', 'area-majority', 'euro-game'],
    keywords: ['ミープル とは', 'ミープル 由来 意味', 'ミープル ボードゲーム'],
  },
  {
    slug: 'cooperative-game',
    title: '協力ゲーム',
    reading: 'きょうりょくげーむ',
    shortDef: '全プレイヤーが協力して共通の目標を達成するゲーム',
    description: [
      '協力ゲーム（Cooperative Game）とは、プレイヤー同士が対戦するのではなく、全員でゲームそのものに立ち向かい、共通のゴールを目指すタイプのゲームです。',
      '「全員勝利」か「全員敗北」かという構造が特徴で、誰かが脱落するのではなくチーム全体で勝敗が決まります。情報共有・役割分担・戦略の話し合いが重要で、コミュニケーションを楽しみたい人に最適です。',
      '「パンデミック」「閃光パニック」などが有名。初心者と経験者が一緒に楽しめるため、ボードゲーム入門にもおすすめです。負けても「次はこうしよう」と自然とリトライしたくなる中毒性があります。',
    ],
    category: 'ゲームタイプ',
    relatedGenre: 'cooperative',
    relatedGenreLabel: '協力ゲーム',
    relatedSlugs: ['worker-placement', 'draft', 'area-majority'],
    keywords: ['協力ゲーム とは', '協力ゲーム ボードゲーム おすすめ', '協力ゲーム 意味'],
  },
  {
    slug: 'area-majority',
    title: 'エリアマジョリティ',
    reading: 'えりあまじょりてぃ',
    shortDef: 'ボードの各エリアで多数派になることを競うシステム',
    description: [
      'エリアマジョリティ（Area Majority）とは、ボード上の複数のエリアにコマを配置し、各エリアで最も多くのコマを持つプレイヤーがそのエリアを支配して得点を得るシステムです。「エリアコントロール」とも呼ばれます。',
      'どのエリアを重点的に攻めるか、どこを捨てるかという資源配分の判断と、相手がどこに集中しているかを読む力が問われます。最終的に「どのエリアを制圧しているか」で勝敗が決まることが多いです。',
      '「エルアレア」「小早川」など多くのゲームに採用されており、テリトリーを巡る駆け引きは直感的で盛り上がります。特に3人以上のプレイで生まれる「第三者の存在」が戦略を複雑にします。',
    ],
    category: '戦略',
    relatedGenre: 'strategy',
    relatedGenreLabel: '戦略ゲーム',
    relatedSlugs: ['worker-placement', 'euro-game', 'cooperative-game'],
    keywords: ['エリアマジョリティ とは', 'エリアマジョリティ 意味 ゲーム', 'エリアコントロール ボードゲーム'],
  },
  {
    slug: 'abstract-game',
    title: 'アブストラクトゲーム',
    reading: 'あぶすとらくとげーむ',
    shortDef: 'テーマなし・運なしで純粋な思考力を競うゲーム',
    description: [
      'アブストラクトゲーム（Abstract Game）とは、特定のテーマや世界観を持たず、ダイスなどの運要素も排除した、純粋なゲームメカニクスだけで構成されるゲームです。',
      'チェスや将棋、囲碁がその代表例。すべての情報がオープンで「運」が絡まないため、実力差がそのまま結果に出ます。「完全情報ゲーム」とも呼ばれます。',
      '一見シンプルに見えても奥が深く、短時間で繰り返し遊べるものも多いです。「ブロックス」「QUORIDOR（コリドール）」など現代のアブストラクトゲームは、ルールがシンプルで初心者にも入りやすいものが増えています。',
    ],
    category: 'ゲームタイプ',
    relatedGenre: 'puzzle',
    relatedGenreLabel: 'パズル・思考ゲーム',
    relatedSlugs: ['euro-game', 'worker-placement', 'deck-building'],
    keywords: ['アブストラクトゲーム とは', 'アブストラクトゲーム 意味', 'アブストラクト ボードゲーム 例'],
  },
  {
    slug: 'euro-game',
    title: 'ユーロゲーム',
    reading: 'ゆーろげーむ',
    shortDef: '勝利点を争う間接的・建設的な競争が特徴の欧州スタイル',
    description: [
      'ユーロゲーム（Euro Game）とは、主にドイツをはじめとするヨーロッパで発展したボードゲームのスタイルです。「ゲルマンゲーム」とも呼ばれます。',
      '特徴は「相手への直接攻撃が少ない」こと。他のプレイヤーを妨害するよりも、自分のエンジンを構築して勝利点（VP）を積み上げることを重視します。戦略性が高く、じっくり考えたい人に向いています。',
      '対義語は「アメリゲーム（アメリトラッシュ）」で、こちらはドラマチックな展開・直接戦闘・運要素が多いスタイル。カタン・チケットトゥライドなどがユーロゲームの代表例で、ゲームマーケットでも人気のジャンルです。',
    ],
    category: 'ゲームスタイル',
    relatedGenre: 'strategy',
    relatedGenreLabel: '戦略ゲーム',
    relatedSlugs: ['worker-placement', 'deck-building', 'area-majority'],
    keywords: ['ユーロゲーム とは', 'ユーロゲーム 意味 ボードゲーム', 'ゲルマンゲーム とは'],
  },
]

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(t => t.slug === slug)
}
