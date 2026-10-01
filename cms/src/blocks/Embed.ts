import type { Block } from 'payload'

// YouTube・Spotify・Google マップ・Instagram などの埋め込み。URL か、埋め込み用の <iframe> をそのまま貼る
export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: '埋め込み', plural: '埋め込み' },
  fields: [
    {
      name: 'url',
      label: 'URL または埋め込みコード',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'YouTube・Spotify・Instagram は URL をそのまま貼れます。Google マップは「共有 → 地図を埋め込む」の HTML を貼ってください。',
      },
    },
    {
      name: 'shape',
      label: '形',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: '自動', value: 'auto' },
        { label: '横長（16:9）', value: '16:9' },
        { label: '横長（4:3）', value: '4:3' },
        { label: '縦長（9:16）', value: '9:16' },
        { label: '低い帯（Spotify の小さいプレーヤー）', value: 'compact' },
      ],
    },
  ],
}
