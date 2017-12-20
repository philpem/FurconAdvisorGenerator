Furry Convention Advisor Screen Generator
=============================

> Try it out: [sneptech.io/furcongenerator/#furcon](http://sneptech.io/furcongenerator/#furcon)

This creates "Advisor" screens as seen in SimCity 2000.

But there's a twist.


Creating a new font
===================

This is mainly a guide for me so I don't forget.

1. Extract the font file from the game using one of the SCI viewers, like SCI Companion or SCI Viewer
2. Run sci-font-extract.py to generate the font file + json file
3. Edit the json file to add the height/origin/box/null-character fields
4. Screenshot a game over in the game, crop the death screen, then edit out the text

There's a reasonable process for making SimCity Advisor images in GIMP:

1. Take the photo
2. Crop and resize it to 63x79 pixels
3. Desaturate it
4. Muck about with the brightness and contrast
5. Posterize it -- about 12 levels seems to work well
6. Copy it into a frame in furcon-font.png


CREDITZ
=======

This is based on Foone's "Sierra Death Generator". It's a delightfully friendly fork, I swear!

