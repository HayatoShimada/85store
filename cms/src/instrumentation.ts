// サーバーの起動時に Payload を初期化する。
// Payload は最初のリクエストで初期化され、Shopify の同期のジョブ（autoRun・10分ごとの取り込み）もそこで動き始める。
// 85pi が再起動したあと、だれも管理画面を開かないと同期が止まったままになるので、起動時に始める（cron: true でジョブの自動実行も始める）
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  getPayload({ config, cron: true }).catch((error) => console.error('Payload の初期化に失敗しました', error))
}
