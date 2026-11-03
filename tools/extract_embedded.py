import re,sys,base64,hashlib,os,json
from PIL import Image
import io
out=sys.argv[1]; os.makedirs(out,exist_ok=True); seen={}; rows=[]
for f in sys.argv[2:]:
    s=open(f,encoding='utf-8',errors='ignore').read()
    for m in re.finditer(r'data:image/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)',s):
        raw=base64.b64decode(m.group(2)); h=hashlib.sha1(raw).hexdigest()[:10]
        if h in seen: seen[h]['in'].append(os.path.basename(f)); continue
        try: im=Image.open(io.BytesIO(raw))
        except Exception: continue
        # context: preceding 120 chars for naming
        ctx=s[max(0,m.start()-160):m.start()]
        name=re.findall(r'[A-Za-z_][A-Za-z0-9_\-]{2,40}',ctx); name=(name[-1] if name else 'img')
        fn=f'{h}_{name}.{ "jpg" if m.group(1) in ("jpeg","jpg") else m.group(1)}'
        open(os.path.join(out,fn),'wb').write(raw)
        seen[h]={'file':fn,'w':im.size[0],'h':im.size[1],'mode':im.mode,'kb':len(raw)//1024,'in':[os.path.basename(f)]}
json.dump(list(seen.values()),open(os.path.join(out,'index.json'),'w'),ensure_ascii=False,indent=1)
for v in seen.values(): print(v)
