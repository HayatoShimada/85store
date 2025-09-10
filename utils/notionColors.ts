/**
 * NotionのcolorプロパティからTailwind CSSクラスを生成するユーティリティ
 */

export type NotionColor = 
  | 'default' 
  | 'gray' 
  | 'brown' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'red';

/**
 * Notionのcolorプロパティからテキスト色のCSSクラスを取得
 */
export function getTextColorClass(color: NotionColor): string {
  const colorMap: Record<NotionColor, string> = {
    default: 'text-gray-700',
    gray: 'text-gray-600',
    brown: 'text-amber-800',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    red: 'text-red-600',
  };
  
  return colorMap[color] || colorMap.default;
}

/**
 * Notionのcolorプロパティから背景色のCSSクラスを取得
 */
export function getBackgroundColorClass(color: NotionColor): string {
  const colorMap: Record<NotionColor, string> = {
    default: 'bg-gray-100',
    gray: 'bg-gray-200',
    brown: 'bg-amber-100',
    orange: 'bg-orange-100',
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    pink: 'bg-pink-100',
    red: 'bg-red-100',
  };
  
  return colorMap[color] || colorMap.default;
}

/**
 * Notionのcolorプロパティからボーダー色のCSSクラスを取得
 */
export function getBorderColorClass(color: NotionColor): string {
  const colorMap: Record<NotionColor, string> = {
    default: 'border-gray-300',
    gray: 'border-gray-400',
    brown: 'border-amber-300',
    orange: 'border-orange-300',
    yellow: 'border-yellow-300',
    green: 'border-green-300',
    blue: 'border-blue-300',
    purple: 'border-purple-300',
    pink: 'border-pink-300',
    red: 'border-red-300',
  };
  
  return colorMap[color] || colorMap.default;
}

/**
 * Notionのcolorプロパティからホバー時の背景色のCSSクラスを取得
 */
export function getHoverBackgroundColorClass(color: NotionColor): string {
  const colorMap: Record<NotionColor, string> = {
    default: 'hover:bg-gray-200',
    gray: 'hover:bg-gray-300',
    brown: 'hover:bg-amber-200',
    orange: 'hover:bg-orange-200',
    yellow: 'hover:bg-yellow-200',
    green: 'hover:bg-green-200',
    blue: 'hover:bg-blue-200',
    purple: 'hover:bg-purple-200',
    pink: 'hover:bg-pink-200',
    red: 'hover:bg-red-200',
  };
  
  return colorMap[color] || colorMap.default;
}

/**
 * 複数の色がある場合の最初の色を取得
 */
export function getPrimaryColor(colors: string[]): NotionColor {
  if (colors.length === 0) return 'default';
  return (colors[0] as NotionColor) || 'default';
}

/**
 * カテゴリ用のスタイルクラスを生成
 */
export function getCategoryStyleClasses(colors: string[]): string {
  const primaryColor = getPrimaryColor(colors);
  return `${getBackgroundColorClass(primaryColor)} ${getTextColorClass(primaryColor)} ${getBorderColorClass(primaryColor)}`;
}

/**
 * タグ用のスタイルクラスを生成
 */
export function getTagStyleClasses(colors: string[]): string {
  const primaryColor = getPrimaryColor(colors);
  return `${getBackgroundColorClass(primaryColor)} ${getTextColorClass(primaryColor)}`;
}
