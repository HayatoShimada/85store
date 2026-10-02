// 同期の定義を登録する。取り込みは登録した順（ページ・ブログ → 記事 → コレクション → メニュー）。
// 記事はブログを、メニューはほかのすべてを参照するので、参照先を先に取り込む
import './pages' // ページ・ブログ
import './collections'
import './articles'
import './menus'

export {
  deleteStoreResourceTask,
  handleField,
  refreshStoreTask,
  storeEndpoints,
  storeHooks,
  storeRefreshEndpoint,
  syncSidebar,
  syncStoreResourceTask,
} from './engine'
