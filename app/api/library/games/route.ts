import { NextResponse } from 'next/server'
type Item = { id:string; title:string; imageUrl:string|null; category:'games' }

export async function GET(req:Request){
  try{
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    const key = process.env.RAWG_API_KEY || ''
    if(!q) return NextResponse.json({ ok:true, items:[] as Item[] })
    if(!key) return NextResponse.json({ ok:false, error:'NO_API_KEY', items:[] },{ status:500 })

    const url = 'https://api.rawg.io/api/games?'+new URLSearchParams({ key, search:q, page_size:'12' })
    const r = await fetch(url,{ cache:'no-store' })
    if(!r.ok) return NextResponse.json({ ok:false, error:`UPSTREAM_${r.status}`, items:[] },{ status:502 })

    const data = await r.json()
    const items: Item[] = (Array.isArray(data?.results)?data.results:[]).map((g:any)=>({
      id:String(g.id),
      title:String(g.name||'').trim(),
      imageUrl:g.background_image || g.background_image_additional || null,
      category:'games',
    }))
    return NextResponse.json({ ok:true, items })
  }catch(e){
    return NextResponse.json({ ok:false, error:'INTERNAL', items:[] },{ status:500 })
  }
}