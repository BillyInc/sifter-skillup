from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw

from generate_product_mockups import (
    ROOT, palette, font, txt, para, icon, shadowed_card, illustration_people,
    illustration_dashboard, mini_path, WHITE, NAVY,
)


OUT = ROOT / "design" / "mockups" / "requested-core-v2"
OUT.mkdir(parents=True, exist_ok=True)


def base(dark=False):
    c = palette(dark)
    im = Image.new("RGBA", (1080, 720), c["bg"])
    d = ImageDraw.Draw(im)
    d.ellipse((-105, -115, 230, 175), fill=c["lilac"])
    d.ellipse((870, -100, 1180, 165), fill=c["mint"])
    d.ellipse((900, 560, 1175, 820), fill=c["yellow"])
    return im, d, c


def rail(d, c, items, active=None):
    d.rounded_rectangle((12, 10, 1068, 47), radius=18, fill=c["card"], outline=c["line"], width=2)
    x = 28
    txt(d, (x, 18), "⌂", 15, c["purple"], True); x += 27
    for i, item in enumerate(items):
        if i: txt(d, (x, 18), "›", 15, c["muted"]); x += 20
        if item == active:
            bbox = d.textbbox((x, 14), item, font=font(11, True))
            d.rounded_rectangle((x-7, 13, bbox[2]+8, 36), radius=12, fill=c["mint"])
        txt(d, (x, 17), item, 11, c["deep_teal"] if item == active else c["muted"], item == active)
        x += int(d.textlength(item, font=font(11, item == active))) + 17


def heading(d, c, title, subtitle, y=65, width=700):
    txt(d, (34, y), title, 31, c["text"], True)
    d.rounded_rectangle((34, y+42, 92, y+47), radius=3, fill=c["teal"])
    para(d, (34, y+57), subtitle, width, 13, c["muted"], 3)


def badge(d, c, x, y, label, kind="spark"):
    d.ellipse((x, y, x+29, y+29), fill=c["teal"])
    icon(d, kind, x+14, y+14, 10, WHITE, c["teal"])
    txt(d, (x+39, y+4), label, 17, c["text"], True)


def card(im, c, box, kind, title, body, fill, compact=False):
    d = ImageDraw.Draw(im); x1,y1,x2,y2 = box
    d.rounded_rectangle(box, radius=14 if compact else 18, fill=fill, outline=c["line"], width=2)
    icon(d, kind, x1+31, y1+30, 18 if compact else 23, c["purple"] if fill in (c["lilac"], c["coral"]) else c["deep_teal"], c["white"])
    txt(d, (x1+61, y1+15), title, 13 if compact else 16, c["text"], True)
    para(d, (x1+17, y1+52), body, x2-x1-34, 11 if compact else 12, c["muted"], 3)


def save(im, name):
    p = OUT / name
    im.convert("RGB").save(p, quality=95, optimize=True)
    return p


def carousel(dark=False):
    paths=[]
    slides=[
        ("01-intro-carousel-direction", "Find the direction that fits you.", "Start with what you know—subjects, a programme, a university or a question.", "Your starting point", [("Subjects", "Begin with the choices already in front of you.", "book"),("Programmes", "See routes and requirements.", "chart"),("Roles", "Understand where a path can lead.", "briefcase")]),
        ("02-intro-carousel-connected", "Make the connections visible.", "Sifter LevelUp keeps the route together from academic choice to domain, role, skill and opportunity.", "One connected route", [("Programme", "Academic context first.", "book"),("Domain", "Follow the field.", "compass"),("Opportunity", "Continue when evidence is ready.", "star")]),
        ("03-intro-carousel-save", "Keep your place as you explore.", "Save the routes, notes and decisions you want to return to—without losing the reason behind them.", "Your guidance, kept together", [("Explore", "Browse before committing.", "search"),("Save", "Keep a path in My World.", "star"),("Return", "Pick up from the next step.", "arrow")]),
    ]
    for index,(stem,title,sub,label,tiles) in enumerate(slides,1):
        im,d,c=base(dark); rail(d,c,["Welcome","LevelUp"],"LevelUp"); heading(d,c,title,sub,66,620)
        illustration_people(d,c,820,78,0.43 if index != 2 else 0.36)
        badge(d,c,34,188,label,"compass")
        x=34
        fills=[c["sky"],c["mint"],c["lilac"]]
        for (t,b,k),f in zip(tiles,fills): card(im,c,(x,230,x+310,360),k,t,b,f); x+=326
        # story strip changes by slide
        d.rounded_rectangle((34,395,1046,555),radius=18,fill=c["card"],outline=c["line"],width=2)
        if index==1:
            txt(d,(66,422),"Choose a starting point",20,c["text"],True); para(d,(66,460),"You can explore as a guest, then create an account when you are ready to keep your choices.",620,13,c["muted"],3); d.rounded_rectangle((750,443,1000,493),radius=24,fill=c["teal"]); txt(d,(875,458),"Explore first  →",16,WHITE,True,"mm")
        elif index==2:
            txt(d,(66,422),"Subjects  →  Programmes  →  Domains  →  Roles",18,c["purple"],True); mini_path(d,c,100,500,820,["Subject","Programme","Domain","Role"])
        else:
            txt(d,(66,422),"A saved path becomes a useful next step",20,c["text"],True); mini_path(d,c,100,500,820,["Browse","Compare","Save","Return"])
        d.ellipse((470,600,482,612),fill=c["teal"]); d.ellipse((492,600,504,612),fill=c["purple"] if index==2 else c["line"]); d.ellipse((514,600,526,612),fill=c["line"] if index<3 else c["purple"])
        d.rounded_rectangle((175,635,905,687),radius=23,fill=c["teal"]); txt(d,(540,651),"Continue  →",19,WHITE,True,"mm")
        paths.append(save(im,f"{stem}-{('dark' if dark else 'light')}.png"))
    return paths


def terms(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","Terms of service"],"Terms of service"); heading(d,c,"Terms of service","Plain-language overview of the platform rules.",66,700)
    d.rounded_rectangle((34,183,290,637),radius=16,fill=c["card"],outline=c["line"],width=2); txt(d,(58,211),"On this page",16,c["text"],True)
    sections=["Using LevelUp","Your account","Saved guidance","Privacy","Contact"]
    y=255
    for i,s in enumerate(sections):
        d.ellipse((58,y+4,69,y+15),fill=c["teal"] if i==0 else c["line"]); txt(d,(84,y),s,13,c["text"] if i==0 else c["muted"],i==0); y+=49
    d.rounded_rectangle((325,183,1046,637),radius=16,fill=c["card"],outline=c["line"],width=2)
    d.rounded_rectangle((354,210,1018,264),radius=13,fill=c["yellow"]); icon(d,"shield",385,237,17,c["purple"],c["white"]); txt(d,(420,222),"Version current · plain-language copy",14,c["text"],True)
    y=294
    for i,(h,b) in enumerate([("Using LevelUp","These terms explain how the service works and what you can expect from the guidance experience."),("Your choices","You can browse, create an account, save guidance and change your preferences in Settings."),("Read to the end","The agreement state becomes available after the content has been read."),("Need help?","Email legal@sifter.app for questions about the current terms.")]):
        txt(d,(360,y),f"{i+1}. {h}",15,c["text"],True); para(d,(360,y+26),b,620,11,c["muted"],3); y+=70
    d.rounded_rectangle((450,653,1000,697),radius=21,fill=c["teal"]); txt(d,(725,666),"I have read the Terms & Conditions",14,WHITE,True,"mm")
    return save(im,f"04-terms-screen-{('dark' if dark else 'light')}.png")


def onboarding(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","Setup"],"Setup"); heading(d,c,"Choose your starting point","This decides which questions, requirements and guidance you will see next. Choose the path that describes you today.",66,770)
    badge(d,c,34,185,"I am joining as","people")
    personas=[("SS1 Student","Start broad: school, stream and early subject guidance","map",c["mint"]),("SS2 Student","Narrow subjects before SS3 and UTME decisions","map",c["sky"]),("SS3 Student","School-based admission guidance for final-year students","book",c["lilac"]),("JAMB Candidate","Tutorial centre or self-taught UTME admission guidance","book",c["yellow"]),("Undergraduate Student","Start from your university and programme","people",c["mint"]),("Educator / Institution","Guide students from a school or tutorial centre","house",c["sky"])]
    x_positions=[34,382,730]; y_positions=[228,370]
    for i,(h,b,k,f) in enumerate(personas):
        x=x_positions[i%3]; y=y_positions[i//3]; card(im,c,(x,y,x+316,y+120),k,h,b,f,True); d.ellipse((x+278,y+18,x+298,y+38),outline=c["deep_teal"],width=2)
    d.rounded_rectangle((34,530,1046,592),radius=15,fill=c["card"],outline=c["line"],width=2); txt(d,(58,551),"Your next questions will be tailored to this choice.",14,c["muted"]); txt(d,(810,551),"Step 1 of 4",14,c["purple"],True)
    d.rounded_rectangle((760,638,1000,688),radius=24,fill=c["teal"]); txt(d,(880,653),"Continue  →",16,WHITE,True,"mm")
    return save(im,f"05-onboarding-screen-{('dark' if dark else 'light')}.png")


def auth_welcome(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","LevelUp"],"LevelUp"); illustration_people(d,c,850,74,0.56); heading(d,c,"Find the direction that fits you.","Programme and university guidance, subject-aware next steps, and your choices saved in one place.",66,640)
    d.rounded_rectangle((34,232,610,605),radius=20,fill=c["card"],outline=c["line"],width=2); txt(d,(66,266),"How do you want to begin?",22,c["text"],True)
    options=[("Create an account","Keep your guidance, notes and saved paths.",c["mint"],"star"),("Log in","Return to your saved guidance.",c["sky"],"arrow"),("Explore without setup","Browse before you create a profile.",c["lilac"],"compass")]
    y=320
    for h,b,f,k in options:
        d.rounded_rectangle((66,y,578,y+75),radius=14,fill=f); icon(d,k,98,y+37,18,c["purple"] if f==c["lilac"] else c["deep_teal"],c["white"]); txt(d,(133,y+17),h,15,c["text"],True); txt(d,(133,y+42),b,11,c["muted"]); y+=89
    d.rounded_rectangle((686,475,1046,606),radius=17,fill=c["yellow"],outline=c["line"],width=2); txt(d,(716,502),"No pressure to know everything yet.",17,c["text"],True); para(d,(716,535),"Start with a question and let the route become clearer.",285,12,c["muted"],3)
    return save(im,f"06-auth-welcome-{('dark' if dark else 'light')}.png")


def auth_login(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","Log in"],"Log in"); heading(d,c,"Welcome back","Return to your saved guidance, maps and learning progress.",66,620); illustration_dashboard(d,c,870,72,0.45)
    d.rounded_rectangle((250,218,830,604),radius=22,fill=c["card"],outline=c["line"],width=2); txt(d,(298,258),"Log in",24,c["text"],True)
    for i,(label,placeholder) in enumerate([("Email or username","Enter your email or username"),("Password","Enter your password")]):
        y=315+i*91; txt(d,(298,y),label,12,c["muted"],True); d.rounded_rectangle((298,y+24,782,y+68),radius=11,fill=c["card2"],outline=c["line"],width=2); txt(d,(318,y+38),placeholder,12,c["muted"])
    txt(d,(298,502),"Forgot password?",12,c["purple"],True); d.rounded_rectangle((298,548,782,592),radius=22,fill=c["teal"]); txt(d,(540,561),"Log in  →",15,WHITE,True,"mm")
    txt(d,(390,643),"Don’t have an account?",12,c["muted"]); txt(d,(550,643),"Create one",12,c["deep_teal"],True)
    return save(im,f"07-auth-login-{('dark' if dark else 'light')}.png")


def auth_signup(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","Create account"],"Create account"); heading(d,c,"Create an account","Save guidance, notes and the paths you want to revisit.",66,620)
    d.rounded_rectangle((34,220,670,622),radius=20,fill=c["card"],outline=c["line"],width=2); txt(d,(70,255),"Your account",22,c["text"],True)
    fields=[("Name","How should we address you?"),("Email","Enter your email"),("Password","Create a password")]
    y=307
    for label,placeholder in fields:
        txt(d,(70,y),label,12,c["muted"],True); d.rounded_rectangle((70,y+23,630,y+67),radius=11,fill=c["card2"],outline=c["line"],width=2); txt(d,(91,y+37),placeholder,12,c["muted"]); y+=83
    d.rounded_rectangle((70,567,630,610),radius=22,fill=c["teal"]); txt(d,(350,580),"Create account  →",15,WHITE,True,"mm")
    d.rounded_rectangle((720,220,1046,622),radius=20,fill=c["lilac"],outline=c["line"],width=2); icon(d,"shield",780,275,27,c["purple"],c["white"]); txt(d,(825,254),"Before you continue",17,c["text"],True); para(d,(760,310),"You will read and accept the current Terms & Conditions and Privacy Policy.",245,12,c["muted"],4)
    for i,t in enumerate(["Read Terms & Conditions","Read Privacy Policy","Choose analytics preference"]):
        y=405+i*55; d.ellipse((760,y,778,y+18),outline=c["purple"],width=2); txt(d,(795,y-1),t,12,c["text"],True)
    return save(im,f"08-auth-signup-{('dark' if dark else 'light')}.png")


def auth_forgot(dark=False):
    im,d,c=base(dark); rail(d,c,["Welcome","Forgot password"],"Forgot password"); heading(d,c,"Reset your password","We’ll help you get back to your saved guidance.",66,620)
    d.rounded_rectangle((34,229,1046,588),radius=22,fill=c["card"],outline=c["line"],width=2); txt(d,(70,268),"A simple recovery path",22,c["text"],True); mini_path(d,c,145,382,790,["Enter email","Check inbox","Set password","Return"])
    d.rounded_rectangle((230,470,850,520),radius=25,fill=c["sky"]); txt(d,(540,486),"We will only use the email you provide for this reset.",13,c["text"],True,"mm")
    d.rounded_rectangle((270,623,810,674),radius=25,fill=c["teal"]); txt(d,(540,637),"Send reset link  →",16,WHITE,True,"mm")
    return save(im,f"09-auth-forgot-password-{('dark' if dark else 'light')}.png")


def home(dark=False):
    im,d,c=base(dark); rail(d,c,["Home","LevelUp"],"Home"); heading(d,c,"Welcome back,\nlet’s level up","Your guidance is a connected path: subjects, programmes, universities, domains, subgroups and roles.",66,650); illustration_people(d,c,860,78,0.42)
    d.rounded_rectangle((34,216,690,350),radius=18,fill=c["card"],outline=c["line"],width=2); txt(d,(66,245),"Continue your guidance",20,c["text"],True); para(d,(66,284),"Pick up from the next clear step in your saved route.",420,12,c["muted"]); d.rounded_rectangle((470,290,650,332),radius=21,fill=c["teal"]); txt(d,(560,301),"Continue  →",14,WHITE,True,"mm")
    badge(d,c,34,388,"Explore your direction","compass")
    cards=[("Programmes","Explore routes and requirements","book",c["sky"]),("Domains","See the fields connected to a choice","people",c["mint"]),("Roles","Understand skills and next steps","briefcase",c["lilac"])]
    x=34
    for h,b,k,f in cards: card(im,c,(x,430,x+316,535),k,h,b,f,True); x+=332
    d.rounded_rectangle((34,574,1046,655),radius=18,fill=c["yellow"],outline=c["line"],width=2); icon(d,"star",75,615,20,c["purple"],c["white"]); txt(d,(112,595),"Your saved careers, bookmarks & notes",16,c["text"],True); txt(d,(800,600),"Open My World  →",13,c["deep_teal"],True)
    return save(im,f"10-home-{('dark' if dark else 'light')}.png")


def explore(dark=False):
    im,d,c=base(dark); rail(d,c,["Home","Explore"],"Explore"); heading(d,c,"Explore by question, field or route","Start with what you know, your subjects, or a university and compare the right options.",66,690); illustration_dashboard(d,c,875,90,0.39)
    d.rounded_rectangle((34,190,1046,246),radius=17,fill=c["card"],outline=c["line"],width=2); icon(d,"search",66,218,16,c["purple"]); txt(d,(101,207),"Search programmes, universities, domains, roles or skills",14,c["muted"])
    badge(d,c,34,273,"Choose a door","compass")
    doors=[("Explore fields and roles","Browse the career map and see where each field can lead.","people",c["mint"]),("Explore university programmes","Start with a programme and check the right requirements.","book",c["sky"]),("Explore opportunities","Continue to scholarships and application windows.","briefcase",c["yellow"])]
    x=34
    for h,b,k,f in doors: card(im,c,(x,316,x+326,443),k,h,b,f,True); x+=342
    d.rounded_rectangle((34,474,1046,591),radius=18,fill=c["lilac"],outline=c["line"],width=2); txt(d,(66,500),"The route stays connected",18,c["purple"],True); mini_path(d,c,100,556,820,["Subjects","Programmes","Domains","Roles"])
    d.rounded_rectangle((265,628,815,678),radius=25,fill=c["teal"]); txt(d,(540,641),"Start matching  →",16,WHITE,True,"mm")
    return save(im,f"11-explore-{('dark' if dark else 'light')}.png")


def opportunities(dark=False):
    im,d,c=base(dark); rail(d,c,["Home","Opportunities"],"Opportunities"); heading(d,c,"Opportunities connected to your direction","Scholarships, application windows and organisations sit after the path—not as disconnected cards.",66,720); illustration_dashboard(d,c,885,82,0.38)
    d.rounded_rectangle((34,191,1046,245),radius=17,fill=c["card"],outline=c["line"],width=2); icon(d,"search",66,218,16,c["purple"]); txt(d,(101,207),"Search opportunities",14,c["muted"]); d.rounded_rectangle((880,204,1015,232),radius=14,fill=c["mint"]); txt(d,(948,211),"Filters +",11,c["deep_teal"],True,"mm")
    badge(d,c,34,272,"Opportunity surfaces","briefcase")
    cards=[("Scholarships","Source-backed listings when available","star",c["lilac"]),("Application windows","Dates and status stay explicit","chart",c["sky"]),("Organisations","See the context before acting","people",c["mint"])]
    x=34
    for h,b,k,f in cards: card(im,c,(x,314,x+326,438),k,h,b,f,True); x+=342
    d.rounded_rectangle((34,475,1046,594),radius=18,fill=c["yellow"],outline=c["line"],width=2); icon(d,"shield",75,515,20,c["purple"],c["white"]); txt(d,(112,493),"Source pending",16,c["text"],True); para(d,(112,523),"If eligibility, dates or organisation details cannot be verified, the interface says so clearly.",650,12,c["muted"],3); txt(d,(820,534),"View data status  →",12,c["deep_teal"],True)
    d.rounded_rectangle((265,635,815,685),radius=25,fill=c["teal"]); txt(d,(540,648),"Browse verified opportunities  →",15,WHITE,True,"mm")
    return save(im,f"12-opportunities-{('dark' if dark else 'light')}.png")


def profile(dark=False):
    im,d,c=base(dark); rail(d,c,["Home","Profile"],"Profile"); heading(d,c,"Your profile and guidance context","Tell us where you are starting from so the domains, roles and opportunities stay relevant.",66,700)
    d.rounded_rectangle((34,210,470,625),radius=20,fill=c["card"],outline=c["line"],width=2); d.ellipse((76,252,176,352),fill=c["lilac"]); icon(d,"people",126,302,32,c["purple"],c["white"]); txt(d,(205,265),"Guidance profile",20,c["text"],True); txt(d,(205,302),"Not set yet",14,c["purple"],True); para(d,(76,390),"Your starting point shapes the questions and recommendations you see next.",320,13,c["muted"],4); d.rounded_rectangle((76,535,400,580),radius=22,fill=c["teal"]); txt(d,(238,548),"Start onboarding  →",14,WHITE,True,"mm")
    badge(d,c,520,210,"Your connected choices","compass")
    rows=[("Saved & bookmarked","Nothing saved yet","star",c["mint"]),("Career guidance","Subjects → programmes → roles","chart",c["sky"]),("My World","Connected personal space","compass",c["lilac"])]
    y=258
    for h,b,k,f in rows: card(im,c,(520,y,1046,y+92),k,h,b,f,True); y+=108
    d.rounded_rectangle((520,598,1046,652),radius=18,fill=c["yellow"],outline=c["line"],width=2); txt(d,(550,617),"Settings, privacy and account controls  →",13,c["text"],True)
    return save(im,f"13-profile-{('dark' if dark else 'light')}.png")


def my_world(dark=False):
    im,d,c=base(dark); rail(d,c,["Home","My World"],"My World"); heading(d,c,"Your saved careers, bookmarks & notes","A personal layer over discovery: what you saved, why it matters and what you want to revisit next.",66,690)
    badge(d,c,34,194,"Your connected choices","star")
    d.rounded_rectangle((34,233,690,570),radius=20,fill=c["card"],outline=c["line"],width=2); txt(d,(68,264),"Saved paths",20,c["text"],True); para(d,(68,299),"Your bookmarks appear here when you save a domain, role, programme or opportunity.",505,12,c["muted"],3)
    # constellation is a saved-world metaphor, not the legacy game world
    nodes=[(150,430,"Programme",c["sky"]),(315,360,"Domain",c["mint"]),(475,455,"Role",c["lilac"]),(580,335,"Note",c["yellow"])]
    for (x1,y1,_,_), (x2,y2,_,_) in zip(nodes,nodes[1:]): d.line((x1,y1,x2,y2),fill=c["teal"],width=3)
    for x,y,label,f in nodes: d.ellipse((x-34,y-34,x+34,y+34),fill=f,outline=c["line"],width=2); icon(d,"star" if label=="Note" else "compass",x,y,19,c["purple"] if f==c["lilac"] else c["deep_teal"],c["white"]); txt(d,(x,y+46),label,11,c["muted"],True,"ma")
    d.rounded_rectangle((750,233,1046,570),radius=20,fill=c["lilac"],outline=c["line"],width=2); txt(d,(782,266),"Notes that travel with you",17,c["purple"],True); para(d,(782,310),"Keep the reason behind a choice, not just the title.",218,12,c["muted"],3); d.rounded_rectangle((782,426,1015,475),radius=23,fill=c["white"]); txt(d,(898,442),"Add a note  +",14,c["deep_teal"],True,"mm"); d.rounded_rectangle((782,496,1015,548),radius=23,fill=c["teal"]); txt(d,(898,510),"Open Explore  →",14,WHITE,True,"mm")
    d.rounded_rectangle((175,625,905,683),radius=26,fill=c["teal"]); txt(d,(540,640),"Return to your next step  →",18,WHITE,True,"mm")
    return save(im,f"14-my-world-{('dark' if dark else 'light')}.png")


def contact(paths):
    thumbs=[]
    for p in paths:
        im=Image.open(p).convert("RGB"); im.thumbnail((320,205)); thumbs.append((p,im.copy()))
    cols=3; cell_w=350; cell_h=250; sheet=Image.new("RGB",(cols*cell_w,((len(thumbs)+cols-1)//cols)*cell_h),"#F4F1FA"); d=ImageDraw.Draw(sheet)
    for i,(p,im) in enumerate(thumbs):
        x=i%cols*cell_w+12; y=i//cols*cell_h+12; sheet.paste(im,(x,y)); d.text((x,y+211),p.stem,font=font(13,True),fill=NAVY)
    sheet.save(OUT/"00-requested-core-index.png",quality=95)


def main():
    paths=[]
    for dark in (False, True):
        paths += carousel(dark)
        paths += [terms(dark), onboarding(dark), auth_welcome(dark), auth_login(dark), auth_signup(dark), auth_forgot(dark), home(dark), explore(dark), opportunities(dark), profile(dark), my_world(dark)]
    (OUT/"README.md").write_text("""# Requested core mockups\n\nThese images cover only the requested career-intelligence surfaces: intro carousel, Terms, onboarding, auth, Home, Explore, Opportunities, Profile and My World. Legacy/gaming routes are intentionally excluded.\n\nEach screen has light and dark variants. The layouts deliberately differ: carousel storytelling, legal reading, persona selection, auth forms, connected home, exploratory search map, opportunity status board, profile identity card and saved-path constellation.\n\nThe copy uses the project’s real concepts and keeps unverified data states explicit.\n""",encoding="utf-8")
    contact(paths)
    print(f"Generated {len(paths)} requested core mockups in {OUT}")


if __name__ == "__main__":
    main()
