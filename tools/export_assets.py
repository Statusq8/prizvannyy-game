import json,os,sys
from PIL import Image
root=sys.argv[1]; man=json.load(open(f'{root}/manifest.json')); out=f'{root}/export'; os.makedirs(out,exist_ok=True)
tot=0; rows=[]
for k,v in man.items():
    if k.startswith('_'): continue
    im=Image.open(f"{root}/extracted/{v['src']}")
    if im.mode=='RGBA':
        bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
        if bb: im=im.crop(bb)
    im.thumbnail((v['max'],v['max']),Image.LANCZOS)
    p=f'{out}/{k}.webp'; im.save(p,'WEBP',quality=v.get('q',82),method=6)
    s=os.path.getsize(p); tot+=s; rows.append((k,im.size,s//1024))
for r in rows: print(r)
print('TOTAL KB',tot//1024)
