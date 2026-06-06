from pathlib import Path
import glob

paths = [Path(p) for p in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)]
repls = [
    ('bg-amber-500/10', 'bg-noctis-gold/10'),
    ('hover:bg-amber-500/10', 'hover:bg-noctis-gold/10'),
    ('border-amber-500/20', 'border-noctis-gold/20'),
    ('border-amber-500/10', 'border-noctis-gold/10'),
    ('text-amber-500', 'text-noctis-gold'),
    ('bg-amber-950/10', 'bg-noctis-card/10'),
    ('bg-amber-950/5', 'bg-noctis-card/5'),
    ('border-amber-950/30', 'border-white/[0.03]'),
    ('text-amber-400', 'text-noctis-gold/80'),
    ('from-amber-500/10', 'from-noctis-gold/10'),
    ('from-amber-500/20', 'from-noctis-gold/20'),
    ('bg-amber-600/20', 'bg-noctis-gold/20'),
    ('bg-amber-600/60', 'bg-noctis-gold/60'),
    ('bg-amber-500', 'bg-noctis-gold'),
    ('border-amber-500', 'border-noctis-gold'),
    ('hover:border-amber-500', 'hover:border-noctis-gold'),
    ('hover:bg-amber-500', 'hover:bg-noctis-gold'),
    ('text-amber-500/80', 'text-noctis-gold/80'),
    ('bg-amber-500/5', 'bg-noctis-gold/5'),
    ('shadow-[0_0_15px_rgba(234,179,8,0.15)]', 'shadow-[0_0_15px_rgba(212,175,55,0.15)]'),
    ('shadow-[0_0_15px_rgba(234,179,8,0.05)]', 'shadow-[0_0_15px_rgba(212,175,55,0.05)]'),
    ('bg-amber-500/20', 'bg-noctis-gold/20'),
    ('border-amber-500/30', 'border-noctis-gold/30'),
]

for path in paths:
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in repls:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Updated {path}')
