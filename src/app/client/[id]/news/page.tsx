import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()

  // Fetch client
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!clientData) {
    notFound()
  }

  // Fetch posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('client_id', resolvedParams.id)
    .order('created_at', { ascending: false })

  const validPosts = posts || []
  
  // Find heroic/featured article (first non-headline, or just first article)
  const heroPost = validPosts.find(p => !p.is_headline) || validPosts[0]
  const breakingNews = validPosts.filter(p => p.is_headline)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-900 selection:text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>
      
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
          <Link href={`/client/${resolvedParams.id}`} className="hover:opacity-80 transition-opacity">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: clientData.theme_color || '#fff' }}>
              {clientData.site_name?.toUpperCase() || 'THE NEWS HUB'}
            </h1>
          </Link>
          <div className="font-sans text-xs font-bold tracking-widest text-gray-400 uppercase">
            DAILY DIGITAL EDITION
          </div>
        </div>
        <div className="w-full h-0.5 bg-white mb-2" />
        <div className="w-full h-[1px] bg-gray-600 mb-12" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        
        {validPosts.length === 0 ? (
          <div className="py-32 text-center border border-gray-800 rounded-2xl bg-[#111]">
            <p className="text-gray-500 font-sans tracking-wide">NO ARTICLES PUBLISHED YET.</p>
            <p className="text-gray-600 text-sm mt-2 font-sans">Check back later for updates from {clientData.site_name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* 🔴 LEFT SIDE: Hero Article */}
            {heroPost && (
              <article className="lg:col-span-8 group">
                <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#111] p-1 shadow-2xl hover:border-gray-700 transition-colors">
                  <div className="aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                    {heroPost.image_url ? (
                      <img 
                        src={heroPost.image_url} 
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <span className="text-gray-700 font-sans italic text-sm">Featured Article Hero Image</span>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 group-hover:text-gray-300 transition-colors">
                      {heroPost.title.toUpperCase()}
                    </h2>
                    <p className="text-gray-400 font-sans text-lg leading-relaxed mb-8 line-clamp-3">
                      {heroPost.content || "Read the full story to learn more about this developing situation and its impact on the region."}
                    </p>
                    <div className="flex items-center justify-between font-sans text-sm text-gray-500 border-t border-gray-800 pt-6">
                      <span className="font-semibold text-gray-300">By Editor in Chief</span>
                      <span>2 min read</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 🔴 RIGHT SIDE: Breaking News / Sidebar */}
            {(breakingNews.length > 0 || validPosts.length > 1) && (
              <aside className="lg:col-span-4 flex flex-col gap-6">
                
                {breakingNews.map((news) => (
                  <article key={news.id} className="border border-gray-800 rounded-xl p-6 bg-[#111] hover:bg-[#161616] transition-colors cursor-pointer group shadow-lg">
                    <div className="font-sans text-[10px] font-bold tracking-widest text-red-600 mb-3 uppercase flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                       Breaking News
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold leading-snug mb-3 group-hover:text-gray-300 transition-colors">
                      {news.title.toUpperCase()}
                    </h3>
                    <p className="text-gray-400 font-sans text-sm leading-relaxed line-clamp-2">
                      {news.content || "Significant developments unfolding. This story is being continuously updated by our newsroom."}
                    </p>
                  </article>
                ))}

                {/* Fill rest with normal posts if breaking news is short */}
                {validPosts.filter(p => !p.is_headline && p.id !== heroPost?.id).slice(0, 3).map((post) => (
                  <article key={post.id} className="border border-gray-800 rounded-xl p-6 bg-[#111] hover:bg-[#161616] transition-colors cursor-pointer group">
                    <div className="font-sans text-[10px] font-bold tracking-widest text-gray-500 mb-3 uppercase">
                       Latest Update
                    </div>
                    <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-gray-300 transition-colors">
                      {post.title.substring(0, 80)}{post.title.length > 80 ? '...' : ''}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm line-clamp-2">
                      {post.content || "Continue reading the full article on our digital platform."}
                    </p>
                  </article>
                ))}
                
              </aside>
            )}

          </div>
        )}
      </main>

    </div>
  )
}
