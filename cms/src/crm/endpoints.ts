import type { Endpoint } from 'payload'
import { htmlToDescription } from '../lib/description'
import { type GeneratedDescription, crmFetch } from './client'
import { photoUrl } from '../shopify/mapping'

// 「説明文を作る」: 保存済みの商品データを 85crm に渡して説明文を作り、説明文の欄に入れて保存する
export const describeEndpoint: Endpoint = {
    path: '/:id/describe',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'ログインしてください' }, { status: 401 })
      const id = Number(req.routeParams?.id)
      const doc = await req.payload.findByID({ collection: 'products', id, depth: 1, req })
      const brand = typeof doc.brand === 'object' && doc.brand ? doc.brand.name : null
      const first = doc.images?.[0]
      const imageUrl = first?.shopifyUrl ?? (first?.photo && typeof first.photo === 'object' ? photoUrl(first.photo) : null)
      const measurements = doc.measurements?.length
        ? JSON.stringify(Object.fromEntries(doc.measurements.map((m) => [m.name, m.value])))
        : null

      try {
        const generated = await crmFetch<GeneratedDescription>('/internal/descriptions/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: doc.shopify?.productId ?? String(doc.id),
            title: doc.title,
            brand,
            product_type: doc.productType,
            category_name: doc.categoryName,
            sizes: (doc.options ?? []).find((o) => o.name === 'サイズ')?.values ?? [],
            era: doc.era,
            styles: doc.style ?? [],
            features: doc.features ?? [],
            condition: doc.condition,
            condition_note: doc.conditionNote,
            measurements,
            description_html: doc.descriptionHtml ?? '',
            image_url: imageUrl,
            tags: doc.tags ?? [],
          }),
        })

        const description = htmlToDescription(req.payload, generated.description_html)
        await req.payload.update({
          collection: 'products',
          id,
          data: {
            description: description as never,
            descriptionHtml: generated.description_html,
            // 状態ランクが空なら、写真から見た候補を入れる
            ...(!doc.condition && generated.suggested_condition ? { condition: generated.suggested_condition as never } : {}),
          },
          req,
          // 生成した HTML をそのまま送る（Lexical から作り直すと形が変わるため）
          context: { keepDescriptionHtml: true },
        })
        return Response.json({ ok: true, usedImage: generated.used_image, suggestedCondition: generated.suggested_condition })
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
      }
    },
  }
