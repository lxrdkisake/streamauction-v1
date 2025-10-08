import { NextResponse } from 'next/server'
type Item = { id:string; title:string; imageUrl:string|null; category:'movies' }
const img = (p?:string|null)=> p ? `https://image.tmdb.org/t/p/w500${p}` : null

export async function GET(req:Request){
  try{
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    const key = process.env.TMDB_API_KEY || ''
    if(!q) return NextResponse.json({ ok:true, items:[] as Item[] })
    if(!key) return NextResponse.json({ ok:false, error:'NO_API_KEY', items:[] },{ status:500 })

    const make=(kind:'movie'|'tv')=>'https://api.themoviedb.org/3/search/'+kind+'?'+new URLSearchParams({
      api_key:key, language:'ru-RU', include_adult:'false', query:q, page:'1'
    })
    const [rm,rt]=await Promise.all([fetch(make('movie'),{cache:'no-store'}), fetch(make('tv'),{cache:'no-store'})])
    if(!rm.ok||!rt.ok) return NextResponse.json({ ok:false, error:'UPSTREAM', items:[] },{ status:502 })

    const [m,t]=await Promise.all([rm.json(),rt.json()])
    const items: Item[] = [
      ...((m?.results??[]) as any[]).map(x=>({ id:`m-${x.id}`, title:String(x.title||x.original_title||'').trim(), imageUrl:img(x.poster_path), category:'movies' as const })),
      ...((t?.results??[]) as any[]).map(x=>({ id:`t-${x.id}`, title:String(x.name||x.original_name||'').trim(), imageUrl:img(x.poster_path), category:'movies' as const })),
    ].slice(0,20)
    return NextResponse.json({ ok:true, items })
  }catch(e){
    return NextResponse.json({ ok:false, error:'INTERNAL', items:[] },{ status:500 })
  }
}