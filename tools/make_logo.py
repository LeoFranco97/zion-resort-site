# Turns the person's logo picture into a clean, colourable vector (assets: src/logo.svg.txt path data).
import cv2, numpy as np, json, sys
src='../reference/picture-1.jpg'
im=cv2.imread(src,0); ys,xs=np.where(im<128)
x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max(); print(x0,x1,y0,y1)
pad=6; c=im[y0-pad:y1+pad+1,x0-pad:x1+pad+1]
S=10
big=cv2.resize(c,None,fx=S,fy=S,interpolation=cv2.INTER_CUBIC)
big=cv2.GaussianBlur(big,(0,0),S*0.55)
_,th=cv2.threshold(big,128,255,cv2.THRESH_BINARY_INV)
cs,h=cv2.findContours(th,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
paths=[]
for i,ct in enumerate(cs):
    if cv2.contourArea(ct)<200: continue
    ap=cv2.approxPolyDP(ct,S*0.28,True)[:,0,:]
    pts=(ap/S-pad)
    paths.append('M'+' '.join(f'{p[0]:.2f},{p[1]:.2f}' for p in pts)+'Z')
W,H=x1-x0+1,y1-y0+1
open('src/logo.json','w').write(json.dumps({'w':int(W),'h':int(H),'d':''.join(paths)}))
print(W,H,len(paths),sum(len(p) for p in paths))
