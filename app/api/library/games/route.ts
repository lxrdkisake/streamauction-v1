import { NextResponse } from 'next/server'

type Item = { id: string; title: string; imageUrl: string | null; category: 'games' }

export async function GET(req: Request) {
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    if (!q) return NextResponse.json({ ok: true, items: [] })

    const key = process.env.RAWG_API_KEY
    if (!key) return NextResponse.json({ ok: true, items: [] })

    const url = 'https://api.rawg.io/api/games?' + new URLSearchParams({
        key, search: q, page_size: '12',
    })

    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return NextResponse.json({ ok: true, items: [] })

    const data = await r.json()
    const items: Item[] = (data?.results || []).map((g: any) => ({
        id: String(g.id),
        title: String(g.name || '').trim(),
        imageUrl: g.background_image || null,
        category: 'games',
    }))

    return NextResponse.json({ ok: true, items })
}
