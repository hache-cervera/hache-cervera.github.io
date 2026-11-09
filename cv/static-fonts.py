# Cuts static instances out of the variable Sora and Inter used by the site.
# Chrome embeds variable fonts in a PDF as Type 3, which some ATS parsers cannot read;
# static instances are embedded as plain TrueType. Run: python3 cv/static-fonts.py
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
for name, weights in (('sora', (600, 700, 800)), ('inter', (400, 500))):
    for w in weights:
        f = instantiateVariableFont(TTFont(f'public/fonts/{name}-latin.woff2'), {'wght': w}, updateFontNames=False)
        f.flavor = 'woff2'
        f.save(f'cv/fonts/{name}-{w}.woff2')
        print('cv/fonts/%s-%d.woff2' % (name, w))
