import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface CommentSectionProps { videoId: string; session: any }

const getRelativeTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'now';
  } catch {
    return 'recently';
  }
};

export default function CommentSection({ videoId, session }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await supabase.from('comments').select('*').eq('video_id', videoId).order('created_at', { ascending: false });
        if (mounted && data) setComments(data);
      } catch (e) {
        const local = JSON.parse(localStorage.getItem(`comments_${videoId}`) || '[]');
        if (mounted) setComments(local);
      }
    };
    load();
    return () => { mounted = false; };
  }, [videoId]);

  const post = async () => {
    if (!text.trim() || !session?.user?.id) return;
    setPosting(true);
    const payload = { video_id: videoId, user_id: session.user.id, content: text.trim(), created_at: new Date().toISOString() };
    try {
      await supabase.from('comments').insert([payload]);
      setComments(prev => [payload, ...prev]);
      setText('');
    } catch (e) {
      const local = JSON.parse(localStorage.getItem(`comments_${videoId}`) || '[]');
      local.unshift(payload);
      localStorage.setItem(`comments_${videoId}`, JSON.stringify(local));
      setComments(local);
      setText('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6 border-t border-white/[0.05] pt-8">
      <div>
        <h3 className="text-[10px] text-noctis-muted font-mono tracking-[0.2em] uppercase mb-4 font-extralight">TRANSMISSION RESPONSES</h3>
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors duration-300">
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && post()}
            placeholder=" "
            className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
          />
          <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
            Add a Response
          </label>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={post}
            disabled={!text.trim() || posting}
            className="px-4 py-2 bg-transparent border border-noctis-gold/30 hover:border-noctis-gold text-noctis-gold font-mono text-[9px] tracking-widest uppercase rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? 'POSTING...' : '▶ POST RESPONSE'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-noctis-muted text-[9px] font-mono uppercase tracking-wider">
            No responses yet. Be the first to transmit.
          </div>
        ) : (
          comments.map((c, idx) => (
            <div key={idx} className="bg-noctis-card/30 border border-white/[0.05] p-4 rounded-2xl backdrop-blur-sm hover:border-white/[0.05] transition-colors duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-noctis-platinum font-light leading-relaxed">{c.content}</div>
                  <div className="text-[8px] text-noctis-muted font-mono uppercase tracking-wider mt-2">{getRelativeTime(c.created_at)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
