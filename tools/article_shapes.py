# Records only the rhythm of each article (block type, length), never its words.
import json
base='../capture/routes/'
routes={'yaremche-ne-bukovel-kudi-investuvati-v-karpatah-u-2026-roci':'en-news-yaremche-ne-bukovel-kudi-investuvati-v-karpatah-u-2026-roci',
 'turistichniy-ta-investiciyniy-potencial-yaremche':'en-news-turistichniy-ta-investiciyniy-potencial-yaremche',
 'forbes-pro-son-daven':'en-news-forbes-pro-son-daven'}
out={}
for slug,r in routes.items():
    d=json.load(open(base+r+'/capture.json'))
    L=[b for b in d['layouts'][0]['blocks'] if b.get('heading') and b.get('y',1)==0]
    end=[b['y'] for b in d['layouts'][0]['blocks'] if b.get('heading')=='NEXT ARTICLE'][0]
    rows=sorted([x for x in d['outline'] if x['tag'] in('p','h2','h3','h4','img','blockquote') or (x['tag']=='div' and x.get('text') and 'P' in x.get('class','').upper() and False)],key=lambda x:x['box']['y'])
    seq=[]
    for x in rows:
        b=x['box']
        if b['y']<560 or b['y']>=end: continue
        t=x.get('text','') or ''
        f=x.get('font','')
        if x['tag']=='img':
            if b['y']>1400: seq.append({'t':'img','w':b['w'],'h':b['h']})
            continue
        size=float(f.split('px')[0]) if 'px' in f else 10
        if size>=50: seq.append({'t':'q','n':len(t)})
        elif size>=20: seq.append({'t':'h','n':len(t)})
        else: seq.append({'t':'p','n':len(t)})
    out[slug]=seq
    print(slug[:20],len(seq),[s['t'] for s in seq][:40])
json.dump(out,open('src/article-shapes.json','w'))
