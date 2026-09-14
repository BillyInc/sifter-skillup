from __future__ import annotations

import math
import os
from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "design" / "mockups" / "product-wide-v1"
OUT.mkdir(parents=True, exist_ok=True)

FONT_DIR = Path("C:/Windows/Fonts")


def font(size: int, bold: bool = False):
    candidates = [
        FONT_DIR / ("segoeuib.ttf" if bold else "segoeui.ttf"),
        FONT_DIR / ("arialbd.ttf" if bold else "arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


NAVY = "#122448"
INK = "#1C2840"
MUTED = "#59657B"
TEAL = "#159D97"
DEEP_TEAL = "#0C746F"
PURPLE = "#6943B6"
PURPLE_DARK = "#4B2C96"
LILAC = "#F0E9FC"
MINT = "#E4F7F0"
SKY = "#EAF2FB"
YELLOW = "#FFF4D6"
CORAL = "#FCEBED"
WHITE = "#FFFFFF"
BG = "#FBFAFF"
LINE = "#DDE2EC"
SOFT = "#F5F7FB"
ORANGE = "#F1A33A"

DARK_BG = "#171426"
DARK_CARD = "#211C36"
DARK_CARD_2 = "#2A2344"
DARK_TEXT = "#F8F6FF"
DARK_MUTED = "#C5BDD8"
DARK_TEAL = "#123C3A"
DARK_PURPLE = "#35255C"
DARK_SKY = "#1E3150"
DARK_YELLOW = "#433617"
DARK_LINE = "#4A4261"


def palette(dark: bool):
    return {
        "bg": DARK_BG if dark else BG,
        "card": DARK_CARD if dark else WHITE,
        "card2": DARK_CARD_2 if dark else SOFT,
        "text": DARK_TEXT if dark else NAVY,
        "muted": DARK_MUTED if dark else MUTED,
        "line": DARK_LINE if dark else LINE,
        "teal": TEAL,
        "deep_teal": "#7EE3D6" if dark else DEEP_TEAL,
        "purple": "#B99AFF" if dark else PURPLE,
        "lilac": DARK_PURPLE if dark else LILAC,
        "mint": DARK_TEAL if dark else MINT,
        "sky": DARK_SKY if dark else SKY,
        "yellow": DARK_YELLOW if dark else YELLOW,
        "orange": "#B87836" if dark else ORANGE,
        "coral": "#4C293D" if dark else CORAL,
        "white": DARK_CARD if dark else WHITE,
    }


def shadowed_card(im, box, fill, radius=22, outline=None, shadow="#DDE2EC"):
    x1, y1, x2, y2 = box
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x1 + 4, y1 + 6, x2 + 4, y2 + 6), radius=radius, fill=shadow + "55")
    layer = layer.filter(ImageFilter.GaussianBlur(7))
    im.alpha_composite(layer)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2 if outline else 1)


def txt(d, xy, text, size=20, fill=INK, bold=False, anchor=None):
    d.text(xy, text, font=font(size, bold), fill=fill, anchor=anchor)


def para(d, xy, text, width, size=18, fill=MUTED, line_gap=7, bold=False):
    max_chars = max(16, int(width / (size * 0.54)))
    lines = wrap(text, max_chars)
    x, y = xy
    for line in lines:
        d.text((x, y), line, font=font(size, bold), fill=fill)
        y += size + line_gap
    return y


def icon(d, kind, cx, cy, r, color, bg=None):
    if bg:
        d.ellipse((cx-r, cy-r, cx+r, cy+r), fill=bg)
    w = max(3, r // 8)
    if kind in {"home", "house"}:
        d.polygon([(cx-r*0.55, cy-2), (cx, cy-r*0.58), (cx+r*0.55, cy-2), (cx+r*0.55, cy+r*0.55), (cx-r*0.55, cy+r*0.55)], fill=color)
        d.rectangle((cx-r*0.12, cy+r*0.18, cx+r*0.12, cy+r*0.55), fill=bg or WHITE)
    elif kind == "book":
        d.rounded_rectangle((cx-r*0.62, cy-r*0.55, cx-1, cy+r*0.5), radius=6, outline=color, width=w)
        d.rounded_rectangle((cx+1, cy-r*0.55, cx+r*0.62, cy+r*0.5), radius=6, outline=color, width=w)
        d.line((cx, cy-r*0.48, cx, cy+r*0.43), fill=color, width=w)
    elif kind in {"search", "compass"}:
        d.ellipse((cx-r*0.52, cy-r*0.52, cx+r*0.25, cy+r*0.25), outline=color, width=w)
        d.line((cx+r*0.18, cy+r*0.18, cx+r*0.62, cy+r*0.62), fill=color, width=w+1)
        if kind == "compass":
            d.polygon([(cx-r*0.05, cy-r*0.3), (cx+r*0.26, cy-r*0.05), (cx-r*0.16, cy+r*0.2)], fill=color)
    elif kind == "people":
        for dx, dy, scale in [(-r*0.37, 0, 0.7), (0, -r*0.16, 0.82), (r*0.37, 0, 0.7)]:
            d.ellipse((cx+dx-r*0.18*scale, cy+dy-r*0.42*scale, cx+dx+r*0.18*scale, cy+dy-r*0.06*scale), fill=color)
            d.rounded_rectangle((cx+dx-r*0.3*scale, cy+dy+r*0.02*scale, cx+dx+r*0.3*scale, cy+dy+r*0.48*scale), radius=8, fill=color)
    elif kind in {"chart", "stats"}:
        d.line((cx-r*0.55, cy+r*0.5, cx-r*0.55, cy-r*0.4, cx+r*0.6, cy-r*0.4), fill=color, width=w)
        d.rectangle((cx-r*0.35, cy+r*0.22, cx-r*0.13, cy+r*0.5), fill=color)
        d.rectangle((cx-r*0.03, cy-r*0.06, cx+r*0.19, cy+r*0.5), fill=color)
        d.rectangle((cx+r*0.29, cy-r*0.3, cx+r*0.51, cy+r*0.5), fill=color)
    elif kind == "briefcase":
        d.rounded_rectangle((cx-r*0.6, cy-r*0.15, cx+r*0.6, cy+r*0.5), radius=7, outline=color, width=w)
        d.arc((cx-r*0.25, cy-r*0.55, cx+r*0.25, cy+r*0.05), 180, 360, fill=color, width=w)
        d.line((cx-r*0.45, cy+r*0.12, cx+r*0.45, cy+r*0.12), fill=color, width=w)
    elif kind in {"star", "spark"}:
        pts = []
        for i in range(10):
            a = -math.pi/2 + i*math.pi/5
            rr = r*0.6 if i % 2 == 0 else r*0.26
            pts.append((cx+math.cos(a)*rr, cy+math.sin(a)*rr))
        d.polygon(pts, fill=color)
    elif kind == "lock":
        d.rounded_rectangle((cx-r*0.48, cy-r*0.05, cx+r*0.48, cy+r*0.52), radius=7, fill=color)
        d.arc((cx-r*0.32, cy-r*0.58, cx+r*0.32, cy+r*0.12), 180, 360, fill=color, width=w)
        d.ellipse((cx-r*0.06, cy+r*0.16, cx+r*0.06, cy+r*0.28), fill=bg or WHITE)
    elif kind == "check":
        d.ellipse((cx-r*0.6, cy-r*0.6, cx+r*0.6, cy+r*0.6), fill=color)
        d.line((cx-r*0.3, cy, cx-r*0.05, cy+r*0.26, cx+r*0.38, cy-r*0.28), fill=bg or WHITE, width=w+1)
    elif kind == "arrow":
        d.line((cx-r*0.55, cy, cx+r*0.45, cy), fill=color, width=w+1)
        d.line((cx+r*0.15, cy-r*0.28, cx+r*0.45, cy), fill=color, width=w+1)
        d.line((cx+r*0.15, cy+r*0.28, cx+r*0.45, cy), fill=color, width=w+1)
    elif kind == "database":
        d.ellipse((cx-r*0.52, cy-r*0.48, cx+r*0.52, cy-r*0.18), fill=color)
        d.rectangle((cx-r*0.52, cy-r*0.32, cx+r*0.52, cy+r*0.42), fill=color)
        d.ellipse((cx-r*0.52, cy+r*0.23, cx+r*0.52, cy+r*0.54), fill=color)
        d.arc((cx-r*0.52, cy-r*0.48, cx+r*0.52, cy-r*0.18), 0, 180, fill=bg or WHITE, width=max(2,w//2))
    elif kind == "shield":
        d.polygon([(cx, cy-r*0.62), (cx+r*0.5, cy-r*0.36), (cx+r*0.42, cy+r*0.24), (cx, cy+r*0.6), (cx-r*0.42, cy+r*0.24), (cx-r*0.5, cy-r*0.36)], fill=color)
        d.line((cx-r*0.22, cy, cx-r*0.02, cy+r*0.2, cx+r*0.3, cy-r*0.2), fill=bg or WHITE, width=w)
    else:
        d.ellipse((cx-r*0.35, cy-r*0.35, cx+r*0.35, cy+r*0.35), fill=color)


def blobs(im, c):
    d = ImageDraw.Draw(im)
    d.ellipse((-140, -160, 360, 270), fill=c["lilac"])
    d.ellipse((1280, -120, 1760, 250), fill=c["mint"])
    d.ellipse((1320, 780, 1710, 1130), fill=c["yellow"])
    d.arc((1250, 80, 1620, 450), 120, 250, fill=c["teal"], width=5)
    for x, y in [(1440, 130), (1510, 170), (1370, 190)]:
        d.ellipse((x, y, x+8, y+8), fill=c["purple"])


def breadcrumb(d, c, parts, x=56, y=35, scale=1.0):
    txt(d, (x, y), "⌂", int(28*scale), c["purple"], True)
    cursor = x + int(35*scale)
    for i, part in enumerate(parts):
        if i == 0:
            txt(d, (cursor, y+3), part, int(18*scale), c["muted"], False)
        else:
            txt(d, (cursor, y+3), "›", int(25*scale), c["muted"], False)
            cursor += int(31*scale)
            if i == len(parts)-1:
                bbox = d.textbbox((cursor, y), part, font=font(int(17*scale), True))
                d.rounded_rectangle((cursor-12, y-5, bbox[2]+14, y+33), radius=18, fill=c["mint"])
                txt(d, (cursor, y+3), part, int(17*scale), c["deep_teal"], True)
            else:
                txt(d, (cursor, y+3), part, int(18*scale), c["muted"], False)
        cursor += int(d.textlength(part, font=font(int(18*scale))) + 24*scale)


def title_block(d, c, title, subtitle, x=56, y=105, max_width=1150, size=46):
    txt(d, (x, y), title, size, c["text"], True)
    d.rounded_rectangle((x, y+70, x+88, y+78), radius=4, fill=c["teal"])
    para(d, (x, y+92), subtitle, max_width, 20, c["muted"], 7)


def section(d, c, x, y, label, kind="spark"):
    d.ellipse((x, y, x+42, y+42), fill=c["teal"])
    icon(d, kind, x+21, y+21, 16, WHITE, c["teal"])
    txt(d, (x+58, y+6), label, 25, c["text"], True)


def illustration_people(d, c, x, y, scale=1.0):
    """Friendly editorial-style people illustration for hero areas."""
    # soft backdrop
    d.ellipse((x-105*scale, y-120*scale, x+260*scale, y+190*scale), fill=c["lilac"])
    d.ellipse((x+115*scale, y-80*scale, x+360*scale, y+180*scale), fill=c["mint"])
    # plant stems
    d.arc((x+250*scale, y+15*scale, x+380*scale, y+170*scale), 120, 250, fill=c["teal"], width=max(2,int(5*scale)))
    for dx, dy in [(315,45),(335,75),(280,100)]:
        d.ellipse((x+(dx-15)*scale, y+(dy-7)*scale, x+(dx+15)*scale, y+(dy+7)*scale), fill=c["teal"])
    people=[(-15, c["purple"], c["yellow"]), (105, c["teal"], c["sky"]), (220, c["orange"], c["lilac"])]
    for dx, shirt, book_bg in people:
        px=x+dx*scale; py=y+88*scale
        d.ellipse((px-32*scale,py-80*scale,px+32*scale,py-16*scale), fill="#F2B98B")
        d.arc((px-40*scale,py-95*scale,px+40*scale,py-5*scale), 185, 355, fill=c["text"], width=max(7,int(14*scale)))
        d.rounded_rectangle((px-48*scale,py-5*scale,px+48*scale,py+105*scale), radius=int(28*scale), fill=shirt)
        d.ellipse((px-9*scale,py-52*scale,px+1*scale,py-42*scale), fill=c["text"])
        d.ellipse((px+13*scale,py-52*scale,px+23*scale,py-42*scale), fill=c["text"])
        d.arc((px-8*scale,py-37*scale,px+21*scale,py-20*scale), 20, 160, fill=c["text"], width=max(2,int(3*scale)))
        d.rounded_rectangle((px+35*scale,py+18*scale,px+80*scale,py+70*scale), radius=int(5*scale), fill=book_bg, outline=c["text"], width=max(2,int(3*scale)))


def illustration_dashboard(d, c, x, y, scale=1.0):
    d.ellipse((x-125*scale,y-120*scale,x+260*scale,y+230*scale),fill=c["sky"])
    d.rounded_rectangle((x-100*scale,y-60*scale,x+130*scale,y+110*scale),radius=int(18*scale),fill=c["white"],outline=c["line"],width=max(2,int(3*scale)))
    d.line((x-65*scale,y+55*scale,x-20*scale,y+25*scale,x+15*scale,y+45*scale,x+80*scale,y-10*scale),fill=c["teal"],width=max(4,int(7*scale)))
    for bx,bh in [(-65,45),(-20,75),(25,58),(70,95)]:
        d.rectangle((x+bx*scale,y+(80-bh)*scale,x+(bx+23)*scale,y+80*scale),fill=c["purple"])
    d.ellipse((x+140*scale,y-35*scale,x+240*scale,y+65*scale),fill=c["lilac"])
    icon(d,"chart",x+190*scale,y+15*scale,33*scale,c["purple"],c["white"])


def feature_card(im, c, box, kind, title, body, fill):
    shadowed_card(im, box, fill, radius=20, outline=c["line"], shadow="#CDD5E4")
    d = ImageDraw.Draw(im)
    x1, y1, x2, y2 = box
    d.ellipse((x1+26, y1+24, x1+96, y1+94), fill=c["white"] if fill != c["white"] else c["mint"])
    icon(d, kind, x1+61, y1+59, 30, c["purple"] if fill in (c["lilac"], c["coral"]) else c["deep_teal"], c["white"] if fill != c["white"] else c["mint"])
    txt(d, (x1+26, y1+111), title, 21, c["text"], True)
    para(d, (x1+26, y1+145), body, x2-x1-52, 16, c["muted"], 5)


def mini_path(d, c, x, y, width, labels):
    step = width / max(1, len(labels)-1)
    d.line((x, y, x+width, y), fill=c["teal"], width=5)
    for i, label in enumerate(labels):
        cx = x + i*step
        d.ellipse((cx-21, y-21, cx+21, y+21), fill=c["purple"] if i % 2 else c["teal"])
        txt(d, (cx, y-1), str(i+1), 17, WHITE, True, "mm")
        txt(d, (cx, y+38), label, 14, c["text"], True, "ma")


def bottom_nav(d, c, w, h, active="Home"):
    y = h-92
    d.rounded_rectangle((28, y, w-28, h-22), radius=24, fill=c["card"], outline=c["line"], width=2)
    items = [("Home", "home"), ("Explore", "search"), ("Opportunities", "briefcase"), ("My World", "star"), ("Profile", "people")]
    step = (w-90)/len(items)
    for i, (label, k) in enumerate(items):
        cx = 45 + step*i + step/2
        active_color = c["teal"] if label == active else c["muted"]
        icon(d, k, int(cx), y+26, 14, active_color, None)
        txt(d, (cx, y+57), label, 11, active_color, label == active, "ma")


def save(im, name):
    path = OUT / name
    im.convert("RGB").save(path, quality=95, optimize=True)
    return path


def web_home(dark=False):
    c = palette(dark); im = Image.new("RGBA", (1600, 1000), c["bg"]); blobs(im, c); d = ImageDraw.Draw(im)
    breadcrumb(d, c, ["Home", "LevelUp"])
    title_block(d, c, "Find your direction, one clear step at a time", "A calm place to explore programmes, universities, domains, roles and next steps—with the evidence kept visible.", size=46)
    shadowed_card(im, (56, 245, 1000, 438), c["card"], 26, c["line"]); d=ImageDraw.Draw(im)
    txt(d, (90, 275), "Continue your guidance", 27, c["text"], True)
    para(d, (90, 320), "Pick up where you left off. Your choices stay connected as you move from subjects to programmes, domains, roles and opportunities.", 760, 19, c["muted"])
    d.rounded_rectangle((90, 385, 425, 425), radius=20, fill=c["teal"])
    txt(d, (258, 405), "Continue exploring  →", 18, WHITE, True, "mm")
    feature_card(im, c, (1040, 245, 1500, 438), "compass", "Your next step", "Source-backed guidance stays organised, even when a path is not ready yet.", c["lilac"])
    section(d, c, 56, 485, "Explore what fits you", "search")
    cards = [("people", "Programmes", "Compare requirements and routes.", c["sky"]), ("compass", "Domains", "See how fields connect.", c["mint"]), ("briefcase", "Roles", "Understand work and skill signals.", c["lilac"]), ("star", "Opportunities", "Find what is available when ready.", c["yellow"])]
    x=56
    for k,t,b,f in cards:
        feature_card(im,c,(x,545,x+350,745),k,t,b,f); x += 375
    section(d, c, 56, 790, "Your saved world", "star")
    shadowed_card(im, (56, 850, 1500, 930), c["card"], 22, c["line"]); d=ImageDraw.Draw(im)
    txt(d, (85, 875), "Saved careers, bookmarks & notes", 19, c["text"], True)
    txt(d, (1040, 875), "Open My World  →", 18, c["deep_teal"], True)
    return save(im, f"01-home-{('dark' if dark else 'light')}.png")


def web_explore(dark=False):
    c = palette(dark); im = Image.new("RGBA", (1600,1000), c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Explore"])
    title_block(d,c,"Explore fields, programmes and roles","Start with a question. The same thread can lead from subjects to programmes, domains, roles, skills and opportunities.",size=45)
    shadowed_card(im,(56,238,1540,312),c["card"],20,c["line"]); d=ImageDraw.Draw(im)
    icon(d,"search",96,275,22,c["purple"],None); txt(d,(132,257),"Search programmes, universities, domains, roles or skills",20,c["muted"])
    section(d,c,56,355,"Choose a starting point","compass")
    cards=[("book","Programmes","See programme routes and requirements.",c["sky"]),("people","Domains","Explore fields and connected sub-groups.",c["mint"]),("briefcase","Roles","Understand roles and skill signals.",c["lilac"]),("star","Opportunities","Open scholarships and application windows.",c["yellow"])]
    x=56
    for k,t,b,f in cards: feature_card(im,c,(x,415,x+350,600),k,t,b,f); x+=375
    section(d,c,56,650,"How the information connects","chart")
    shadowed_card(im,(56,710,1540,905),c["card"],26,c["line"]); d=ImageDraw.Draw(im)
    mini_path(d,c,190,790,1160,["Subjects","Programmes","Domains","Roles","Skills","Opportunities"])
    return save(im,f"02-explore-{('dark' if dark else 'light')}.png")


def web_domain(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Explore","Domains","Social Sciences"])
    title_block(d,c,"Social Sciences — the bigger field","Understand how people live together, how communities work and how societies change. Related areas remain visible so the next choice is easier.",size=44)
    section(d,c,56,290,"Questions this field asks","people")
    qs=[("How do groups and communities make decisions?",c["mint"]),("What causes inequality and how does it affect lives?",c["lilac"]),("How do cultures, norms and institutions shape behaviour?",c["yellow"]),("How do societies change over time?",c["sky"])]
    x=56
    for i,(q,f) in enumerate(qs):
        shadowed_card(im,(x,350,x+350,450),f,18,c["line"]); d=ImageDraw.Draw(im); icon(d,["people","house","compass","chart"][i],x+47,400,25,c["deep_teal"] if i%2==0 else c["purple"],None); para(d,(x+92,378),q,235,18,c["text"],6); x+=375
    section(d,c,56,500,"What people do","briefcase")
    actions=[("Study people, groups and cultures","people"),("Collect and analyse data","chart"),("Interview and observe communities","people"),("Develop theories and test ideas","book"),("Share findings to solve problems","arrow")]
    x=56
    for t,k in actions:
        shadowed_card(im,(x,560,x+278,675),c["card"],18,c["line"]); d=ImageDraw.Draw(im); icon(d,k,x+45,617,23,c["teal"],None); para(d,(x+82,586),t,170,16,c["text"],5); x+=298
    shadowed_card(im,(56,725,1540,905),c["lilac"],26,c["line"]); d=ImageDraw.Draw(im); icon(d,"compass",110,815,40,c["purple"],c["white"]); txt(d,(180,755),"Where Sociology fits",25,c["purple"],True); para(d,(180,800),"Sociology is one programme inside the bigger field of Social Sciences. The relationship stays explicit as you move deeper.",780,17,c["text"]); txt(d,(1210,815),"Explore this area  →",18,c["deep_teal"],True,"mm")
    return save(im,f"03-domain-detail-{('dark' if dark else 'light')}.png")


def web_programme(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Explore","Programmes","Programme detail"])
    title_block(d,c,"Programme intelligence, made easier to scan","The detail view brings together requirements, related domains, roles and next steps without pretending to know what the source does not yet provide.",size=42)
    shadowed_card(im,(56,260,1030,520),c["card"],24,c["line"]); d=ImageDraw.Draw(im); icon(d,"book",112,323,34,c["purple"],c["lilac"]); txt(d,(175,295),"Programme overview",25,c["text"],True); txt(d,(175,335),"Source-backed detail",16,c["deep_teal"],True); para(d,(175,374),"Requirements and programme information appear here when they are available from the connected data source.",680,18,c["muted"])
    chips=[("Requirements",c["mint"],"check"),("Universities",c["sky"],"house"),("Domains & roles",c["lilac"],"compass"),("Save",c["yellow"],"star")]
    x=90
    for label,f,k in chips:
        d.rounded_rectangle((x,455,x+190,495),radius=20,fill=f); icon(d,k,x+22,475,12,c["deep_teal"],None); txt(d,(x+43,462),label,14,c["text"],True); x+=210
    section(d,c,1090,260,"Trust states","shield")
    states=[("Available","Source-backed",c["mint"],"check"),("Coming soon","No verified detail yet",c["yellow"],"star"),("Locked","Requires a saved path",c["lilac"],"lock")]
    y=330
    for label,bg,k,kind in states:
        shadowed_card(im,(1090,y,1500,y+125),k,18,c["line"]); d=ImageDraw.Draw(im); icon(d,kind,1138,y+62,24,c["deep_teal"] if kind=="check" else c["purple"],None); txt(d,(1185,y+32),label,19,c["text"],True); txt(d,(1185,y+68),bg,16,c["muted"]); y+=145
    section(d,c,56,575,"Continue the thread","arrow")
    shadowed_card(im,(56,635,1540,865),c["card"],26,c["line"]); d=ImageDraw.Draw(im); mini_path(d,c,180,745,1160,["Requirements","Compare","Domain","Role","Opportunity"])
    d.rounded_rectangle((1120,875,1500,930),radius=27,fill=c["teal"]); txt(d,(1310,902),"Save this path  →",18,WHITE,True,"mm")
    return save(im,f"04-programme-detail-{('dark' if dark else 'light')}.png")


def web_opportunities(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Opportunities"]); title_block(d,c,"Opportunities that connect to your direction","Scholarships, application windows and organisations sit after the path—not as disconnected cards.",size=44)
    shadowed_card(im,(56,238,1540,312),c["card"],20,c["line"]); d=ImageDraw.Draw(im); icon(d,"search",96,275,22,c["purple"]); txt(d,(132,257),"Search opportunities",20,c["muted"]); d.rounded_rectangle((1190,252,1495,295),radius=20,fill=c["mint"]); txt(d,(1342,274),"Filters  +",16,c["deep_teal"],True,"mm")
    section(d,c,56,355,"Opportunity surfaces","briefcase")
    items=[("Scholarships","Source-backed listings appear here when available.","star",c["lilac"]),("Application windows","Dates and status stay explicit.","chart",c["sky"]),("Organisations","See the organisation context before acting.","people",c["mint"])]
    x=56
    for t,b,k,f in items: feature_card(im,c,(x,415,x+460,620),k,t,b,f); x+=490
    section(d,c,56,685,"Honest state","shield")
    shadowed_card(im,(56,745,1540,900),c["yellow"],24,c["line"]); d=ImageDraw.Draw(im); icon(d,"star",115,823,30,c["purple"],c["white"]); txt(d,(170,780),"Source pending",24,c["text"],True); para(d,(170,824),"When a listing cannot be verified, the interface explains that clearly instead of filling the space with invented dates, organisations or awards.",890,17,c["muted"]); txt(d,(1240,823),"View data status  →",17,c["deep_teal"],True,"mm")
    return save(im,f"05-opportunities-{('dark' if dark else 'light')}.png")


def web_myworld(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","My World"]); title_block(d,c,"Your saved careers, bookmarks & notes","A personal layer over the discovery system: what you save, why it matters and what you want to revisit next.",size=44)
    section(d,c,56,275,"Saved paths","star")
    shadowed_card(im,(56,335,1000,590),c["card"],24,c["line"]); d=ImageDraw.Draw(im); icon(d,"star",115,405,30,c["purple"],c["lilac"]); txt(d,(175,375),"Your saved paths will appear here",24,c["text"],True); para(d,(175,420),"Bookmark a domain or role from Explore and it shows up in this space. The empty state is part of the journey—not a dead end.",720,18,c["muted"]); d.rounded_rectangle((175,520,520,565),radius=23,fill=c["teal"]); txt(d,(348,542),"Open Explore  →",17,WHITE,True,"mm")
    feature_card(im,c,(1060,335,1500,590),"lock","Learning tracks & portfolio","This area is reserved for the connected learning and portfolio experience.",c["lilac"])
    section(d,c,56,655,"A useful next action","arrow")
    shadowed_card(im,(56,715,1500,875),c["mint"],24,c["line"]); d=ImageDraw.Draw(im); mini_path(d,c,180,790,1120,["Explore","Save","Compare","Return"])
    return save(im,f"06-my-world-{('dark' if dark else 'light')}.png")


def web_admin(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Workspace","Admin","Overview"]); title_block(d,c,"Workspace overview","A source-aware control room for guidance, verification and student support. Metrics only appear when the connected source provides them.",size=44)
    cards=[("Students","Student guidance and provisioning","people",c["mint"]),("Guidance","Review the next checkpoint","compass",c["lilac"]),("Verify","Keep source-backed records trustworthy","shield",c["sky"]),("Market intelligence","Open the evidence workspace","chart",c["yellow"])]
    x=56
    for t,b,k,f in cards: feature_card(im,c,(x,285,x+350,480),k,t,b,f); x+=375
    section(d,c,56,545,"Operational states","shield")
    shadowed_card(im,(56,605,1540,850),c["card"],25,c["line"]); d=ImageDraw.Draw(im)
    rows=[("Guidance queue","Source pending","yellow"),("Verification review","No verified items yet","mint"),("Market signal","Connect a source to populate","sky")]
    y=640
    for label,status,key in rows:
        f=c[key]; d.rounded_rectangle((90,y,1465,y+60),radius=16,fill=f); txt(d,(120,y+18),label,17,c["text"],True); txt(d,(910,y+18),status,16,c["muted"]); icon(d,"arrow",1390,y+30,15,c["deep_teal"],None); y+=73
    return save(im,f"07-admin-overview-{('dark' if dark else 'light')}.png")


def web_auth(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Welcome","LevelUp"])
    illustration_people(d,c,1070,180,1.35)
    title_block(d,c,"Find the direction that fits you.","Programme and university guidance, subject-aware next steps, and your choices saved in one place.",size=46,max_width=820)
    shadowed_card(im,(56,300,780,810),c["card"],28,c["line"]); d=ImageDraw.Draw(im)
    txt(d,(105,345),"Welcome back",27,c["text"],True)
    txt(d,(105,410),"Email or username",15,c["muted"],True); d.rounded_rectangle((105,440,725,495),radius=14,fill=c["card2"],outline=c["line"],width=2)
    txt(d,(130,457),"Enter your email or username",16,c["muted"])
    txt(d,(105,530),"Password",15,c["muted"],True); d.rounded_rectangle((105,560,725,615),radius=14,fill=c["card2"],outline=c["line"],width=2); txt(d,(130,577),"Enter your password",16,c["muted"])
    txt(d,(105,645),"Forgot password?",15,c["purple"],True); d.rounded_rectangle((105,695,725,750),radius=27,fill=c["teal"]); txt(d,(415,722),"Log in  →",18,WHITE,True,"mm")
    txt(d,(105,860),"New here?",16,c["muted"]); txt(d,(210,860),"Create account",16,c["deep_teal"],True)
    return save(im,f"15-auth-sign-in-{('dark' if dark else 'light')}.png")


def web_onboarding(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Welcome","Setup"]); title_block(d,c,"Tell us where you are starting","This keeps the next step relevant without guessing your background.",size=46,max_width=900)
    txt(d,(56,310),"Choose the closest match",24,c["text"],True)
    options=[("SS1 or SS2 student","Build a foundation and explore options.",c["mint"],"book"),("SS3 student","Move from subjects toward requirements.",c["sky"],"chart"),("JAMB candidate","Check the next admission-aware step.",c["yellow"],"compass"),("Current undergraduate","Explore a new direction or opportunity.",c["lilac"],"people")]
    x=56; y=370
    for i,(head,body,f,k) in enumerate(options):
        if i==2: x=56; y=630
        shadowed_card(im,(x,y,x+700,y+190),f,24,c["line"]); d=ImageDraw.Draw(im); icon(d,k,x+72,y+88,34,c["purple"] if i%2 else c["deep_teal"],c["white"]); txt(d,(140,y+45),head,22,c["text"],True); para(d,(140,y+86),body,500,17,c["muted"],5); d.ellipse((660,y+70,700,y+110),outline=c["deep_teal"],width=3); x=800 if x==56 else 56
    d.rounded_rectangle((1120,875,1515,930),radius=27,fill=c["teal"]); txt(d,(1318,902),"Continue  →",18,WHITE,True,"mm")
    return save(im,f"16-onboarding-start-{('dark' if dark else 'light')}.png")


def web_compare(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Explore","Programmes","Compare"]); title_block(d,c,"Compare the paths you are considering","Keep the same fields aligned so differences are visible without inventing missing information.",size=43)
    shadowed_card(im,(56,280,1540,885),c["card"],26,c["line"]); d=ImageDraw.Draw(im)
    cols=[("Path A",c["lilac"]),("Path B",c["sky"]),("Path C",c["mint"])]
    xs=[470,820,1170]
    txt(d,(95,335),"Comparison field",19,c["muted"],True)
    for x,(label,f) in zip(xs,cols): d.rounded_rectangle((x,315,x+280,380),radius=16,fill=f); txt(d,(x+140,347),label,20,c["text"],True,"mm")
    fields=["Requirements","Subject fit","Related domains","Roles and skills","Source status"]
    y=430
    for row in fields:
        txt(d,(95,y+18),row,17,c["text"],True)
        for x,f in zip(xs,cols): d.rounded_rectangle((x,y,x+280,y+58),radius=12,fill=c["card2"],outline=c["line"],width=1); txt(d,(x+18,y+19),"Source pending",15,c["muted"])
        y+=76
    d.rounded_rectangle((1120,915,1500,960),radius=24,fill=c["teal"]); txt(d,(1310,938),"Save comparison  →",17,WHITE,True,"mm")
    return save(im,f"17-programme-compare-{('dark' if dark else 'light')}.png")


def web_role(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Explore","Roles","Role detail"]); title_block(d,c,"Role detail, without the guesswork","See the problem a role solves, the skills connected to it and the next evidence-backed step.",size=44)
    illustration_dashboard(d,c,1190,180,0.9)
    section(d,c,56,300,"What this role connects","briefcase")
    cards=[("Problems they solve","Understand the real-world questions behind the work.","compass",c["lilac"]),("Skills","See the skill signals connected to the role.","chart",c["mint"]),("Learning path","Build first, add next, practise, specialise.","book",c["sky"])]
    x=56
    for head,body,k,f in cards: feature_card(im,c,(x,360,x+465,575),k,head,body,f); x+=495
    shadowed_card(im,(56,650,1540,850),c["card"],24,c["line"]); d=ImageDraw.Draw(im); txt(d,(90,690),"Your learning path",25,c["purple"],True); mini_path(d,c,180,775,1150,["Build first","Add next","Practise","Specialise"])
    d.rounded_rectangle((1090,900,1500,955),radius=27,fill=c["teal"]); txt(d,(1295,927),"Save this role  →",18,WHITE,True,"mm")
    return save(im,f"18-role-detail-{('dark' if dark else 'light')}.png")


def web_guidance(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Workspace","Guidance","Student checkpoint"]); title_block(d,c,"Student guidance checkpoint","The admin view follows the student’s own thread and makes the next review action explicit.",size=44)
    shadowed_card(im,(56,285,980,820),c["card"],26,c["line"]); d=ImageDraw.Draw(im); txt(d,(95,330),"Guidance thread",25,c["text"],True); para(d,(95,375),"Student guidance → checkpoint → review → verify → report",720,18,c["muted"])
    mini_path(d,c,160,500,650,["Start","Explore","Checkpoint","Review"])
    rows=[("Current checkpoint","Source pending",c["yellow"]),("Next action","Review guidance",c["mint"]),("Evidence","Not attached",c["sky"])]
    y=610
    for label,status,f in rows: d.rounded_rectangle((95,y,900,y+55),radius=14,fill=f); txt(d,(120,y+17),label,16,c["text"],True); txt(d,(500,y+17),status,16,c["muted"]); y+=67
    feature_card(im,c,(1080,285,1500,540),"shield","Review safely","Verification actions stay attached to the source and the student context.",c["lilac"])
    feature_card(im,c,(1080,585,1500,820),"check","Next state","No action is marked complete until the underlying state changes.",c["mint"])
    return save(im,f"19-admin-guidance-{('dark' if dark else 'light')}.png")


def web_opportunity_detail(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Opportunities","Opportunity detail"]); title_block(d,c,"Opportunity detail","The detail view keeps eligibility, timing and source status together so a user can decide whether to continue.",size=45)
    shadowed_card(im,(56,280,1000,790),c["card"],26,c["line"]); d=ImageDraw.Draw(im); icon(d,"briefcase",120,355,36,c["purple"],c["lilac"]); txt(d,(185,325),"Opportunity overview",27,c["text"],True); txt(d,(185,370),"Source-backed when available",16,c["deep_teal"],True)
    fields=[("Eligibility","Not verified yet"),("Application window","Source pending"),("Organisation","Open organisation context")]
    y=465
    for label,value in fields: txt(d,(110,y),label,17,c["muted"],True); txt(d,(440,y),value,17,c["text"]); d.line((110,y+34,900,y+34),fill=c["line"],width=2); y+=80
    d.rounded_rectangle((110,700,500,755),radius=27,fill=c["teal"]); txt(d,(305,727),"Save opportunity  →",17,WHITE,True,"mm")
    shadowed_card(im,(1080,280,1500,790),c["yellow"],25,c["line"]); d=ImageDraw.Draw(im); icon(d,"shield",1150,360,34,c["purple"],c["white"]); txt(d,(1210,325),"Trust state",24,c["text"],True); txt(d,(1210,375),"Source pending",20,c["purple"],True); para(d,(1120,450),"If dates, eligibility or organisation details cannot be verified, that is the product state—not a blank to fill with guesses.",320,17,c["muted"],7)
    return save(im,f"20-opportunity-detail-{('dark' if dark else 'light')}.png")


def web_settings(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Profile","Settings"]); title_block(d,c,"Settings that keep you in control","Manage your profile, theme and privacy without losing the path you have built.",size=44)
    section(d,c,56,290,"Personal settings","people")
    groups=[("Profile","Name, role and guidance context","people",c["mint"]),("Appearance","Light mode / dark mode","star",c["lilac"]),("Privacy","Terms, privacy and saved data","shield",c["sky"]),("Referrals","Invite someone to explore","arrow",c["yellow"])]
    x=56
    for head,body,k,f in groups: feature_card(im,c,(x,350,x+350,560),k,head,body,f); x+=375
    section(d,c,56,650,"Account actions","shield")
    shadowed_card(im,(56,710,1540,865),c["card"],24,c["line"]); d=ImageDraw.Draw(im); txt(d,(95,760),"Log out",18,c["text"],True); txt(d,(1320,760),"→",22,c["purple"],True); d.line((95,805,1460,805),fill=c["line"],width=2); txt(d,(95,825),"Delete account",16,c["muted"]); txt(d,(1320,825),"Requires confirmation",15,c["muted"])
    return save(im,f"21-settings-{('dark' if dark else 'light')}.png")


def mobile_screen(name, title, subtitle, cards, active="Home", dark=False, locked=False):
    c=palette(dark); im=Image.new("RGBA",(900,1600),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    # mobile safe-area and app shell
    d.rounded_rectangle((28,22,872,1572),radius=44,fill=c["bg"],outline=c["line"],width=2)
    txt(d,(72,58),"9:41",16,c["muted"],True); txt(d,(770,58),"●  ▮",14,c["muted"],True)
    breadcrumb(d,c,["Home",title],72,110,0.78)
    txt(d,(72,190),title,37,c["text"],True)
    para(d,(72,252),subtitle,730,18,c["muted"],6)
    y=350
    for i,(kind,head,body,fill) in enumerate(cards):
        shadowed_card(im,(72,y,828,y+190),fill,22,c["line"]); d=ImageDraw.Draw(im); icon(d,kind,130,y+64,28,c["purple"] if i%2 else c["deep_teal"],c["white"]); txt(d,(190,y+37),head,20,c["text"],True); para(d,(190,y+77),body,560,16,c["muted"],5); y+=215
    if locked:
        shadowed_card(im,(72,y+5,828,y+165),c["lilac"],22,c["line"]); d=ImageDraw.Draw(im); icon(d,"lock",130,y+78,26,c["purple"],c["white"]); txt(d,(190,y+43),"Locked until your path is ready",19,c["text"],True); txt(d,(190,y+82),"The state is explained, not hidden.",15,c["muted"])
    bottom_nav(d,c,900,1600,active)
    return save(im,name)


def components(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Design system","Components & states"]); title_block(d,c,"Components that explain what happens next","Every component has a default, loading, empty, error, locked, selected, saved and disabled state where the product needs it.",size=42)
    section(d,c,56,290,"Search contract","search")
    boxes=[("Idle","Search programmes, universities, domains, roles or skills",c["card"],"search"),("Focused","Cursor active; filters become available",c["sky"],"search"),("No results","Try a wider term or browse a field",c["yellow"],"star"),("Saved","This path is now in My World",c["mint"],"check")]
    x=56
    for label,body,f,k in boxes:
        shadowed_card(im,(x,350,x+350,490),f,18,c["line"]); d=ImageDraw.Draw(im); txt(d,(x+22,372),label,17,c["text"],True); icon(d,k,x+45,438,19,c["purple"] if k=="star" else c["deep_teal"]); para(d,(x+80,415),body,240,14,c["muted"],4); x+=375
    section(d,c,56,555,"Feedback contract","check")
    rows=[("Loading","keep place; show motion"),("Error","explain; offer retry"),("Locked","explain unlock condition"),("Disabled","show why action is unavailable")]
    y=615
    for label,body in rows:
        d.rounded_rectangle((56,y,730,y+60),radius=16,fill=c["card"],outline=c["line"],width=2); txt(d,(80,y+18),label,16,c["text"],True); txt(d,(300,y+18),body,16,c["muted"]); y+=70
    shadowed_card(im,(820,615,1540,895),c["lilac"],24,c["line"]); d=ImageDraw.Draw(im); txt(d,(860,650),"Action → response → change",22,c["purple"],True); para(d,(860,705),"Tap Save → confirmation appears → the path enters My World → the next action becomes Return or Compare.",570,18,c["text"],8); mini_path(d,c,900,835,470,["Action","Response","State","Next"])
    return save(im,f"08-components-states-{('dark' if dark else 'light')}.png")


def flow_map(dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Product map","Journeys & contracts"]); title_block(d,c,"One connected product, not a pile of screens","The route families are designed around the actual relationships in the project and keep the source boundary visible at every step.",size=41)
    section(d,c,56,280,"Core discovery contract","compass")
    nodes=[("Subjects",c["mint"]),("Programmes",c["sky"]),("Domains / sub-groups",c["lilac"]),("Roles",c["yellow"]),("Skills",c["mint"]),("Opportunities",c["sky"])]
    y=360; xs=[70,315,560,805,1050,1295]
    for i,(label,f) in enumerate(nodes):
        if i < len(nodes)-1: d.line((xs[i]+175,y+48,xs[i+1]-20,y+48),fill=c["teal"],width=5); icon(d,"arrow",xs[i+1]-20,y+48,12,c["teal"])
        shadowed_card(im,(xs[i],y,xs[i]+175,y+96),f,18,c["line"]); d=ImageDraw.Draw(im); txt(d,(xs[i]+87,y+45),label,15,c["text"],True,"mm")
    section(d,c,56,555,"Student / admin handoff","people")
    shadowed_card(im,(56,625,1540,870),c["card"],24,c["line"]); d=ImageDraw.Draw(im)
    mini_path(d,c,170,715,1160,["Student guidance","Checkpoint","Review","Verify","Report"])
    para(d,(140,795),"Admin surfaces observe and support the same student journey; they do not invent a parallel dataset.",1280,17,c["muted"],5)
    return save(im,f"09-flow-map-{('dark' if dark else 'light')}.png")


def component_sheet(kind, dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    labels={"navigation":("Navigation components","Breadcrumbs, bottom navigation and path actions stay legible at every depth."),"cards":("Card components","The same card language carries discovery, detail, saved and locked states."),"search":("Search components","Search is a small state machine: idle, focused, typing, searching, results and no results."),"feedback":("Feedback components","The system answers every action with a visible state and a useful next step.")}
    title,sub=labels[kind]
    breadcrumb(d,c,["Design system",title]); title_block(d,c,title,sub,size=43,max_width=1200)
    if kind=="navigation":
        section(d,c,56,300,"Breadcrumbs","compass")
        shadowed_card(im,(56,365,1544,445),c["card"],20,c["line"]); d=ImageDraw.Draw(im); breadcrumb(d,c,["Home","Explore","Domains","Current page"],92,386,0.9)
        section(d,c,56,500,"Action strip","arrow")
        shadowed_card(im,(56,560,1544,690),c["card"],24,c["line"]); d=ImageDraw.Draw(im); d.rounded_rectangle((90,600,440,650),radius=25,fill=c["teal"]); txt(d,(265,625),"Continue  →",17,WHITE,True,"mm"); d.rounded_rectangle((480,600,840,650),radius=25,fill=c["lilac"]); txt(d,(660,625),"Save this path  ☆",17,c["purple"],True,"mm"); d.rounded_rectangle((880,600,1260,650),radius=25,fill=c["card2"],outline=c["line"],width=2); txt(d,(1070,625),"Back to start  ←",17,c["text"],True,"mm")
        section(d,c,56,745,"Mobile navigation","home"); bottom_nav(d,c,1600,1000,"Explore")
    elif kind=="cards":
        section(d,c,56,300,"Discovery cards","compass")
        feature_card(im,c,(56,360,500,600),"book","Programmes","Requirements and routes.",c["sky"]); feature_card(im,c,(540,360,984,600),"people","Domains","Fields and connected sub-groups.",c["mint"]); feature_card(im,c,(1024,360,1468,600),"briefcase","Roles","Problems, skills and learning paths.",c["lilac"])
        section(d,c,56,670,"State variations","shield")
        states=[("Default",c["card"],"Open detail →"),("Selected",c["mint"],"Selected ✓"),("Locked",c["lilac"],"Locked · why?")]
        x=56
        for label,f,cta in states:
            shadowed_card(im,(x,730,x+440,870),f,20,c["line"]); d=ImageDraw.Draw(im); txt(d,(x+24,754),label,17,c["text"],True); txt(d,(x+24,808),cta,16,c["deep_teal"] if label!="Locked" else c["purple"],True); x+=485
    elif kind=="search":
        section(d,c,56,300,"Input states","search")
        rows=[("Idle","Search programmes, universities, domains, roles or skills",c["card"]),("Focused","Type to search…",c["sky"]),("Searching","Looking across connected sources…",c["lilac"]),("No results","Try a wider term or browse a field",c["yellow"])]
        y=360
        for label,body,f in rows:
            txt(d,(80,y+16),label,17,c["text"],True); d.rounded_rectangle((300,y,1450,y+58),radius=15,fill=f,outline=c["line"],width=2); icon(d,"search",335,y+29,15,c["purple"] if label=="Searching" else c["deep_teal"]); txt(d,(375,y+18),body,16,c["muted"]); y+=78
        shadowed_card(im,(56,700,1544,875),c["mint"],24,c["line"]); d=ImageDraw.Draw(im); txt(d,(95,740),"Results → selected → saved",23,c["text"],True); mini_path(d,c,180,820,1120,["Results","Selected","Saved"])
    else:
        section(d,c,56,300,"Feedback states","check")
        rows=[("Loading","Keep the layout; show progress.",c["sky"],"chart"),("Error","Explain what happened; offer retry.",c["coral"],"shield"),("Success","Confirm the change and name the next action.",c["mint"],"check"),("Locked","Explain the condition for unlocking.",c["lilac"],"lock")]
        y=360
        for label,body,f,k in rows:
            shadowed_card(im,(56,y,1544,y+95),f,18,c["line"]); d=ImageDraw.Draw(im); icon(d,k,105,y+47,22,c["purple"] if k in ("shield","lock") else c["deep_teal"]); txt(d,(160,y+26),label,18,c["text"],True); txt(d,(160,y+58),body,16,c["muted"]); y+=120
        d.rounded_rectangle((1080,875,1500,930),radius=27,fill=c["teal"]); txt(d,(1290,902),"Try again  →",18,WHITE,True,"mm")
    return save(im,f"{ {'navigation':'22-component-navigation','cards':'23-component-cards','search':'24-component-search','feedback':'25-component-feedback'}[kind]}-{('dark' if dark else 'light')}.png")


def family_board(number, title, subtitle, section_title, cards, flow, dark=False):
    c=palette(dark); im=Image.new("RGBA",(1600,1000),c["bg"]); blobs(im,c); d=ImageDraw.Draw(im)
    breadcrumb(d,c,["Home","Workspace",title]); title_block(d,c,title,subtitle,size=44)
    section(d,c,56,290,section_title,"compass")
    x=56
    for i,(head,body,k,f) in enumerate(cards):
        if i and i % 3 == 0: x=56
        y=350 if i < 3 else 590
        feature_card(im,c,(x,y,x+450,y+190),k,head,body,f); x += 490
    section(d,c,56,835,"Connected next step","arrow")
    shadowed_card(im,(56,890,1544,975),c["card"],20,c["line"]); d=ImageDraw.Draw(im); mini_path(d,c,220,932,1120,flow)
    return save(im,f"{number}-{title.lower().replace(' ','-')}-{('dark' if dark else 'light')}.png")


def ref_card(im, c, box, kind, title, body, fill, compact=False):
    d=ImageDraw.Draw(im); x1,y1,x2,y2=box; radius=13 if compact else 16
    d.rounded_rectangle(box,radius=radius,fill=fill,outline=c["line"],width=2)
    icon(d,kind,x1+33,y1+31,18 if compact else 22,c["purple"] if fill in (c["lilac"],c["coral"]) else c["deep_teal"],c["white"])
    txt(d,(x1+62,y1+16),title,13 if compact else 15,c["text"],True)
    para(d,(x1+18,y1+53),body,x2-x1-36,11 if compact else 12,c["muted"],3)


def ref_header(d,c,crumbs,title,subtitle,hero="people"):
    # Rounded breadcrumb rail, matching the supplied educational screen references.
    d.rounded_rectangle((12,10,1068,47),radius=18,fill=c["card"],outline=c["line"],width=2)
    breadcrumb(d,c,crumbs,28,18,0.53)
    txt(d,(34,64),title,31,c["text"],True)
    d.rounded_rectangle((34,108,92,113),radius=3,fill=c["teal"])
    para(d,(34,122),subtitle,660,13,c["muted"],3)
    if hero=="people": illustration_people(d,c,800,64,0.42)
    elif hero=="chart": illustration_dashboard(d,c,850,78,0.42)
    else:
        d.ellipse((790,62,960,220),fill=c["lilac"]); icon(d,hero,875,140,48,c["purple"],c["white"])


def ref_section(d,c,x,y,label,kind):
    d.ellipse((x,y,x+29,y+29),fill=c["teal"]); icon(d,kind,x+14,y+14,10,WHITE,c["teal"]); txt(d,(x+39,y+3),label,17,c["text"],True)


def reference_infographic(kind, dark=False):
    c=palette(dark); im=Image.new("RGBA",(1080,720),c["bg"]); d=ImageDraw.Draw(im)
    # quiet corner colour fields, as in the supplied mockups
    d.ellipse((-100,-110,230,180),fill=c["lilac"]); d.ellipse((870,-100,1180,170),fill=c["mint"]); d.ellipse((900,560,1170,820),fill=c["yellow"])
    if kind=="home":
        ref_header(d,c,["Home","LevelUp"],"Find your direction, one clear step at a time","Explore programmes, domains, roles and opportunities with the source status kept visible.","people")
        ref_section(d,c,34,181,"What you can explore","compass")
        cards=[("book","Programmes","See routes and requirements.",c["sky"]),("people","Domains","Understand fields and sub-groups.",c["mint"]),("briefcase","Roles","Connect problems, skills and paths.",c["lilac"]),("star","Opportunities","Return to verified next steps.",c["yellow"])]
        x=34
        for k,t,b,f in cards: ref_card(im,c,(x,218,x+246,322),k,t,b,f); x+=258
        ref_section(d,c,34,343,"Your connected journey","arrow")
        # left journey and right tool panel
        d.rounded_rectangle((34,380,520,604),radius=15,fill=c["card"],outline=c["line"],width=2)
        steps=[("Start with context","Subjects and goals","book",c["lilac"]),("Explore the route","Programme → domain → role","compass",c["mint"]),("Save what matters","My World remembers","star",c["sky"]),("Take the next step","Opportunity when ready","arrow",c["yellow"])]
        y=395
        for i,(h,b,k,f) in enumerate(steps):
            icon(d,k,69,y+22,17,c["purple"] if i%2==0 else c["deep_teal"],f); txt(d,(100,y+5),h,13,c["text"],True); txt(d,(100,y+27),b,11,c["muted"]); y+=51
            if i<3: d.line((69,y-10,69,y+4),fill=c["teal"],width=2)
        d.rounded_rectangle((548,380,1046,604),radius=15,fill=c["lilac"],outline=c["line"],width=2); txt(d,(570,400),"Friendly starting points",17,c["purple"],True)
        tools=[("Search", "Find by programme, domain or role", "search", c["white"]),("Compare", "Line up the same fields", "chart", c["white"]),("Save", "Keep the reason behind a choice", "star", c["white"])]
        x=570
        for k,b,ic,f in tools:
            ref_card(im,c,(x,442,x+145,566),ic,k,b,f,True); x+=157
        d.rounded_rectangle((175,634,905,688),radius=22,fill=c["teal"]); txt(d,(540,652),"Continue to Explore  →",20,WHITE,True,"mm")
    elif kind=="domain":
        ref_header(d,c,["Home","Explore","Domains","Social Sciences"],"Social Sciences — the bigger field","Understand how people live together, how communities work and how societies change.","people")
        ref_section(d,c,34,181,"Questions this field asks","people")
        qs=[("How do groups and communities make decisions?","people",c["mint"]),("What causes inequality?","house",c["lilac"]),("How do cultures and norms shape behaviour?","compass",c["yellow"]),("How do societies change over time?","chart",c["sky"])]
        x=34
        for q,k,f in qs: ref_card(im,c,(x,218,x+246,298),k,q,"Start with a question.",f,True); x+=258
        ref_section(d,c,34,323,"What people do","briefcase")
        actions=[("Study people","people",c["white"]),("Collect data","chart",c["white"]),("Interview communities","people",c["white"]),("Test ideas","book",c["white"]),("Share findings","arrow",c["white"])]
        x=34
        for t,k,f in actions: ref_card(im,c,(x,359,x+190,430),k,t,"",f,True); x+=203
        d.rounded_rectangle((34,454,1046,535),radius=13,fill=c["lilac"],outline=c["line"],width=2); icon(d,"compass",73,494,23,c["purple"],c["white"]); txt(d,(112,468),"Where your choice fits",16,c["purple"],True); para(d,(112,493),"The domain view keeps related areas visible so a programme or role can be understood in context.",650,11,c["text"],3)
        ref_section(d,c,34,558,"Explore connected areas","arrow")
        d.rounded_rectangle((34,593,1046,652),radius=20,fill=c["teal"]); txt(d,(540,612),"Open programmes, sub-groups and roles  →",18,WHITE,True,"mm")
    elif kind=="programme":
        ref_header(d,c,["Home","Explore","Programmes","Programme detail"],"Programme intelligence, made easier to scan","Requirements, universities, domains, roles and next steps stay connected in one view.","chart")
        ref_section(d,c,34,181,"What this programme connects","book")
        cards=[("check","Requirements","Show what is verified.",c["mint"]),("house","Universities","See where it can be studied.",c["sky"]),("compass","Domains","Follow the related field.",c["lilac"]),("briefcase","Roles","Understand where it can lead.",c["yellow"])]
        x=34
        for k,t,b,f in cards: ref_card(im,c,(x,218,x+246,322),k,t,b,f); x+=258
        ref_section(d,c,34,343,"Your route from here","arrow")
        d.rounded_rectangle((34,380,690,544),radius=14,fill=c["card"],outline=c["line"],width=2); mini_path(d,c,120,435,530,["Requirements","University","Domain","Role"])
        txt(d,(74,490),"The next action follows the data you already selected.",12,c["muted"])
        d.rounded_rectangle((720,380,1046,544),radius=14,fill=c["yellow"],outline=c["line"],width=2); icon(d,"shield",770,430,25,c["purple"],c["white"]); txt(d,(815,407),"Trust state",15,c["text"],True); txt(d,(815,445),"Source pending",14,c["purple"],True); para(d,(755,478),"Missing detail stays visible instead of becoming invented content.",245,11,c["muted"],3)
        d.rounded_rectangle((175,590,905,668),radius=26,fill=c["teal"]); txt(d,(540,615),"Save this programme path  →",20,WHITE,True,"mm")
    else:  # role
        ref_header(d,c,["Home","Explore","Roles","Role detail"],"Role detail, without the guesswork","See the problems connected to the role, the skills it signals and the next learning step.","chart")
        ref_section(d,c,34,181,"What this role connects","briefcase")
        cards=[("compass","Problems they solve","Make the real-world question visible.",c["lilac"]),("chart","What they produce","Reports, insight or decisions when verified.",c["sky"]),("shield","Skills","See the skills attached to the role.",c["mint"]),("star","Where it fits","Keep domains and pathways connected.",c["yellow"])]
        x=34
        for k,t,b,f in cards: ref_card(im,c,(x,218,x+246,322),k,t,b,f); x+=258
        ref_section(d,c,34,343,"Your learning path","arrow")
        d.rounded_rectangle((34,380,1046,546),radius=14,fill=c["card"],outline=c["line"],width=2); mini_path(d,c,120,432,820,["Build first","Add next","Practise","Specialise"]); para(d,(78,488),"A role page becomes useful when it shows the next action, not just a title.",720,12,c["muted"],3)
        d.rounded_rectangle((175,590,905,668),radius=26,fill=c["teal"]); txt(d,(540,615),"Save this role and continue  →",20,WHITE,True,"mm")
    return save(im,f"40-reference-{kind}-{('dark' if dark else 'light')}.png")


def route_title(route):
    bits=[b for b in route.replace("\\","/").replace(".tsx","").split("/") if b and b != "app"]
    cleaned=[]
    for bit in bits:
        if bit.startswith("(") and bit.endswith(")"):
            continue
        bit=bit.replace("[jambName]","insight").replace("[userId]","student").replace("[id]","detail").replace("[subgroupId]","subgroup")
        bit=bit.replace("index","home")
        cleaned.extend(bit.replace("-"," ").split())
    return " ".join(w.capitalize() for w in cleaned) or "Home"


def route_family(route):
    r=route.lower().replace("\\","/")
    if "admin" in r: return "admin"
    if "auth" in r or "sign-in" in r or "signup" in r or "forgot-password" in r: return "auth"
    if "admission" in r or "programme" in r or "compare" in r: return "admission"
    if "domain" in r or "field" in r or "role" in r or "elite" in r: return "career"
    if "pathway" in r: return "pathway"
    if "opportunit" in r or "scholar" in r or "window" in r or "organisation" in r: return "opportunity"
    if "skill" in r or "lesson" in r or "map" in r or "track" in r or "world" in r or "portfolio" in r or "streak" in r: return "learning"
    if "feed" in r or "guild" in r or "leaderboard" in r: return "social"
    if "profile" in r or "setting" in r or "referral" in r or "diary" in r or "github" in r or "my-school" in r: return "profile"
    return "core"


def route_copy(family):
    return {
        "auth": ("Choose a starting point", "Account context", "Subjects and goals", "Continue", "Your next step", ["Welcome","Set up","Explore","Return"], "people"),
        "admission": ("What this screen connects", "Programme", "Universities", "Requirements", "Next step", ["Subjects","Programme","University","Career map"], "chart"),
        "career": ("What this screen connects", "Field", "Sub-groups", "Roles", "Skills", ["Explore","Understand","Save","Continue"], "people"),
        "pathway": ("Choose the route that fits", "Career change", "Credentials", "Further study", "Entrepreneurship", ["Context","Pathway","Evidence","Next"], "compass"),
        "opportunity": ("Keep the evidence visible", "Opportunity", "Eligibility", "Application window", "Organisation", ["Discover","Check","Save","Continue"], "briefcase"),
        "learning": ("Your next learning step", "Build", "Practise", "Reflect", "Evidence", ["Start","Learn","Practise","Portfolio"], "book"),
        "social": ("How you participate", "Feed", "Guild", "Progress", "Return", ["Join","Participate","Reflect","Return"], "people"),
        "profile": ("Keep your choices in control", "Profile", "Appearance", "Privacy", "Saved data", ["Profile","Preferences","Privacy","Save"], "people"),
        "admin": ("Workspace surfaces", "Overview", "Guidance", "Verify", "Report", ["Student","Checkpoint","Review","Report"], "shield"),
        "core": ("What happens next", "Explore", "Understand", "Save", "Continue", ["Start","Explore","Save","Return"], "compass"),
    }[family]


def route_mockup(route, number, dark=False):
    c=palette(dark); im=Image.new("RGBA",(1080,720),c["bg"]); d=ImageDraw.Draw(im)
    d.ellipse((-100,-110,230,180),fill=c["lilac"]); d.ellipse((870,-100,1180,170),fill=c["mint"]); d.ellipse((900,560,1170,820),fill=c["yellow"])
    title=route_title(route); family=route_family(route); section,a,b,cc,dd,flow,hero=route_copy(family)
    ref_header(d,c,["Home",title],title,"A connected screen for the Sifter LevelUp journey, with source status and next actions kept visible.",hero)
    ref_section(d,c,34,181,section,"compass")
    fills=[c["sky"],c["mint"],c["lilac"],c["yellow"]]; kinds=["book","people","chart","arrow"]; labels=[a,b,cc,dd]; x=34
    for i,label in enumerate(labels):
        ref_card(im,c,(x,218,x+246,322),kinds[i],label,"Source-backed when available.",fills[i],True); x+=258
    ref_section(d,c,34,343,"Connected state and components","arrow")
    d.rounded_rectangle((34,380,690,544),radius=14,fill=c["card"],outline=c["line"],width=2); mini_path(d,c,120,432,530,flow); txt(d,(74,490),"The interface shows the next action instead of inventing missing information.",11,c["muted"])
    d.rounded_rectangle((720,380,1046,544),radius=14,fill=c["lilac"],outline=c["line"],width=2); icon(d,"shield",770,430,25,c["purple"],c["white"]); txt(d,(815,407),"State",15,c["text"],True); txt(d,(815,445),"Source pending",14,c["purple"],True); para(d,(755,478),"Empty, loading, locked and error states stay explicit.",245,11,c["muted"],3)
    d.rounded_rectangle((175,590,905,668),radius=26,fill=c["teal"]); txt(d,(540,615),"Continue from this screen  →",20,WHITE,True,"mm")
    rel=ROOT/"design"/"mockups"/"product-wide-v1"/"route-screens"; rel.mkdir(parents=True,exist_ok=True)
    stem=f"{number:03d}-{title.lower().replace(' ','-')}".replace("/","-")
    out=rel/f"{stem}-{('dark' if dark else 'light')}.png"; im.convert("RGB").save(out,quality=95,optimize=True); return out


def generate_route_screens():
    routes=[]
    for p in sorted((ROOT/"app").rglob("*.tsx")):
        if p.name != "_layout.tsx":
            routes.append(p.relative_to(ROOT).as_posix())
    paths=[]; manifest=["# Route-by-route raster mockups\n\nGenerated from the current `app/` route files. Each route has a light and dark PNG.\n\n| Route | Light | Dark |\n|---|---|---|\n"]
    for i,route in enumerate(routes,1):
        light=route_mockup(route,i,False); dark=route_mockup(route,i,True); paths += [light,dark]
        manifest.append(f"| `{route}` | [{light.name}]({light.name}) | [{dark.name}]({dark.name}) |\n")
    route_dir=ROOT/"design"/"mockups"/"product-wide-v1"/"route-screens"
    (route_dir/"README.md").write_text("".join(manifest),encoding="utf-8")
    cols=4; cell_w=300; cell_h=220; sheet=Image.new("RGB",(cols*cell_w,math.ceil(len(routes)/cols)*cell_h),"#F4F1FA"); sd=ImageDraw.Draw(sheet)
    for i,(route,light) in enumerate(zip(routes,paths[::2])):
        thumb=Image.open(light).convert("RGB"); thumb.thumbnail((280,180)); x=(i%cols)*cell_w+10; y=(i//cols)*cell_h+10; sheet.paste(thumb,(x,y)); sd.text((x,y+185),f"{i+1:03d} {route_title(route)[:28]}",font=font(12,True),fill=NAVY)
    sheet.save(route_dir/"00-route-index.png",quality=95)
    return paths


def contact_sheet(paths):
    thumbs=[]
    for p in paths:
        im=Image.open(p).convert("RGB"); im.thumbnail((320,200)); thumbs.append((p,im.copy()))
    w=1040; h=math.ceil(len(thumbs)/3)*245
    sheet=Image.new("RGB",(w,h),"#F4F1FA"); d=ImageDraw.Draw(sheet)
    for i,(p,im) in enumerate(thumbs):
        x=(i%3)*345+12; y=(i//3)*245+12
        sheet.paste(im,(x,y)); d.text((x,y+205),p.stem[:40],font=font(14,True),fill=NAVY)
    sheet.save(OUT/"00-mockup-index.png",quality=95)


def main():
    paths=[]
    for dark in (False, True):
        pc = palette(dark)
        paths += [web_home(dark), web_explore(dark), web_domain(dark), web_programme(dark), web_opportunities(dark), web_myworld(dark), web_admin(dark), web_auth(dark), web_onboarding(dark), web_compare(dark), web_role(dark), web_guidance(dark), web_opportunity_detail(dark), web_settings(dark), components(dark), flow_map(dark)]
        paths += [component_sheet(k, dark) for k in ("navigation", "cards", "search", "feedback")]
        paths += [
            family_board("26", "Admission browse", "A source-aware place to compare requirements and see the next admission step.", "Admission surfaces", [("Browse programmes","Filter and compare without hiding missing data.","book",pc["sky"]),("Requirements","Keep subject and requirement states visible.","check",pc["mint"]),("Admission insight","Explain what the source supports.","chart",pc["lilac"])], ["Browse","Filter","Compare","Detail"], dark),
            family_board("27", "Pathways hub", "Career change, credentials, entrepreneurship, PhD and upgrade routes belong in one connected pathway surface.", "Pathway surfaces", [("Career change","A route for changing direction.","arrow",pc["lilac"]),("Credentials","A route for recognised next steps.","shield",pc["mint"]),("Further study","PhD and upgrade routes stay explicit.","book",pc["sky"])], ["Pathway","Evidence","Role","Opportunity"], dark),
            family_board("28", "Scholarships", "Scholarships and application windows are useful only when eligibility, dates and sources are clear.", "Opportunity surfaces", [("Scholarships","Source-backed listings when available.","star",pc["yellow"]),("Application windows","Dates and status are not guessed.","chart",pc["sky"]),("Organisation","Open the surrounding context.","people",pc["mint"])], ["Listing","Eligibility","Window","Continue"], dark),
            family_board("29", "Learning hub", "Skills, streaks, portfolio and learning paths extend the discovery thread after a choice is saved.", "Learning surfaces", [("Skills","See the signals connected to a path.","chart",pc["mint"]),("Streaks","Keep momentum visible without pressure.","star",pc["yellow"]),("Portfolio","Turn progress into evidence when ready.","book",pc["lilac"])], ["Path","Learn","Practise","Portfolio"], dark),
            family_board("30", "Community", "Feed, guild and leaderboard surfaces provide social context without changing the source of truth.", "Social surfaces", [("Feed","Updates and reflections in one place.","people",pc["sky"]),("Guild","A shared space for progress.","people",pc["mint"]),("Leaderboard","A visible state, never a fabricated number.","chart",pc["lilac"])], ["Join","Participate","Reflect","Return"], dark),
            family_board("31", "Profile", "Profile, privacy, referrals and account controls keep the learner in control of the experience.", "Profile surfaces", [("Profile","Your context and choices.","people",pc["mint"]),("Appearance","Light mode and dark mode.","star",pc["lilac"]),("Privacy","Terms, privacy and saved data.","shield",pc["sky"])], ["Profile","Preferences","Privacy","Save"], dark),
        ]
        paths += [reference_infographic(kind, dark) for kind in ("home", "domain", "programme", "role")]
    paths += [
        mobile_screen("10-mobile-home-light.png", "Home", "Your choices stay connected as you explore.", [("compass","Continue your guidance","Pick up from the next clear step.",MINT),("search","Explore fields","Programmes, domains and roles.",SKY),("star","My World","Saved paths and notes.",LILAC)], dark=False),
        mobile_screen("11-mobile-explore-light.png", "Explore", "Start with a question, then follow the thread.", [("search","Search","Programmes, universities, domains, roles or skills.",SKY),("book","Programmes","Requirements and routes.",MINT),("people","Domains & roles","Fields, sub-groups and skill signals.",LILAC)], active="Explore", dark=False),
        mobile_screen("12-mobile-my-world-light.png", "My World", "Your saved careers, bookmarks & notes.", [("star","Saved paths","Your bookmarks appear here.",LILAC),("book","Notes","Keep the reason behind a choice.",MINT)], active="My World", dark=False, locked=True),
        mobile_screen("13-mobile-home-dark.png", "Home", "Your choices stay connected as you explore.", [("compass","Continue your guidance","Pick up from the next clear step.",DARK_TEAL),("search","Explore fields","Programmes, domains and roles.",DARK_SKY),("star","My World","Saved paths and notes.",DARK_PURPLE)], dark=True),
        mobile_screen("14-mobile-explore-dark.png", "Explore", "Start with a question, then follow the thread.", [("search","Search","Programmes, universities, domains, roles or skills.",DARK_SKY),("book","Programmes","Requirements and routes.",DARK_TEAL),("people","Domains & roles","Fields, sub-groups and skill signals.",DARK_PURPLE)], active="Explore", dark=True),
    ]
    route_paths = generate_route_screens()
    contact_sheet(paths)
    print(f"Generated {len(paths)+1} curated raster mockups and {len(route_paths)} route-screen PNGs in {OUT}")


if __name__ == "__main__":
    main()
