# Font generation script from FontCustom
# https://github.com/FontCustom/fontcustom/
# http://fontcustom.com/

import fontforge
import os
import md5
import subprocess
import tempfile
import json
import copy
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), ".."))
import path

AUTO_WIDTH = False
KERNING = 15

cp = 0x2801
m = md5.new()

f = fontforge.font()
f.encoding = 'UnicodeFull'
f.design_size = 16
f.em = 512
f.ascent = 448
f.descent = 64

manifest_file = open(path.MANIFEST_PATH, 'r')
manifest_data = json.loads(manifest_file.read())
if os.path.isfile(path.BUILD_DATA_PATH):
  build_data_file = open(path.BUILD_DATA_PATH, 'r')
  build_data_old = json.loads(build_data_file.read())
else:
  build_data_old = {}

manifest_file.close()
if os.path.isfile(path.BUILD_DATA_PATH):
  build_data_file.close()

# if you want rebuild font file with icon unchanged, comment the following line of code.
if 'icons' not in build_data_old:
  build_data_old['icons'] = []
init_len = len(build_data_old['icons'])
print "Load Icons: %s" % ( init_len )

build_data = copy.deepcopy(build_data_old)
build_data['font_name'] = manifest_data['font_name']
build_data['class_name'] = manifest_data['class_name']
build_data['icons'] = []

font_name = build_data['font_name']
m.update(build_data['class_name'] + ';')
m.update(font_name + ';')

for dirname, dirnames, filenames in os.walk(path.INPUT_SVG_DIR):
  for filename in filenames:
    name, ext = os.path.splitext(filename)
    filePath = os.path.join(dirname, filename)
    size = os.path.getsize(filePath)

    if ext in ['.svg', '.eps']:

      # see if this file is already in the manifest
      chr_code = None
      for icon in build_data_old['icons']:
        if icon['name'] == name:
          chr_code = icon['code']
          break

      if chr_code is None:
        # this is a new src icon
        print 'New Icon: \n - %s' % (name)

        while True:
          chr_code = '0x%x' % (cp)
          already_exists = False
          for icon in build_data_old['icons']:
            if icon.get('code') == chr_code:
              already_exists = True
              cp += 1
              chr_code = '0x%x' % (cp)
              continue
          if not already_exists:
            break

        print ' - %s' % chr_code
        build_data_old['icons'].append({
          'name': name,
          'code': chr_code
        })

      build_data['icons'].append({
        'name': name,
        'code': chr_code
      })

      if ext in ['.svg']:
        # hack removal of <switch> </switch> tags
        svgfile = open(filePath, 'r+')
        tmpsvgfile = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
        svgtext = svgfile.read()
        svgfile.seek(0)

        # replace the <switch> </switch> tags with 'nothing'
        svgtext = svgtext.replace('<switch>', '')
        svgtext = svgtext.replace('</switch>', '')

        tmpsvgfile.file.write(svgtext)

        svgfile.close()
        tmpsvgfile.file.close()

        filePath = tmpsvgfile.name
        # end hack

      m.update(name + str(size) + ';')
      glyph = f.createChar( int(chr_code, 16) )
      glyph.importOutlines(filePath)

      # if we created a temporary file, let's clean it up
      if tmpsvgfile:
        os.unlink(tmpsvgfile.name)

      # set glyph size explicitly or automatically depending on autowidth
      if AUTO_WIDTH:
        glyph.left_side_bearing = glyph.right_side_bearing = 0
        glyph.round()
      else:
        # force a manual size when autowidth is disabled
        # print " - Standard Width: %s" % (name)
        glyph.width = 512

    # resize glyphs if autowidth is enabled
    if AUTO_WIDTH:
      f.autoWidth(0, 0, 512)

  fontfile = '%s/icons' % (path.OUTPUT_FONT_DIR)

build_hash = m.hexdigest()[0:10]

if build_hash == build_data_old.get('build_hash') and init_len and os.path.isfile(fontfile + '.svg'):
  print "Source files unchanged, did not rebuild fonts"

else:
  build_data['build_hash'] = build_hash

  f.fontname = font_name
  f.familyname = font_name
  f.fullname = font_name
  f.generate(fontfile + '.ttf')
  f.generate(fontfile + '.svg')

  # Fix SVG header for webkit
  # from: https://github.com/fontello/font-builder/blob/master/bin/fontconvert.py
  svgfile = open(fontfile + '.svg', 'r+')
  svgtext = svgfile.read()
  svgfile.seek(0)
  svgfile.write(svgtext.replace('''<svg>''', '''<svg xmlns="http://www.w3.org/2000/svg">'''))
  svgfile.close()

  try:
    subprocess.Popen([path.SCRIPT_PATH + '/sfnt2woff', fontfile + '.ttf'], stdout=subprocess.PIPE)
  except OSError:
    # If the local version of sfnt2woff fails (i.e., on Linux), try to use the
    # global version. This allows us to avoid forcing OS X users to compile
    # sfnt2woff from source, simplifying install.
    subprocess.call(['sfnt2woff', fontfile + '.ttf'])

  # eotlitetool.py script to generate IE7-compatible .eot fonts, comment it temporary
  # subprocess.call('python ' + scriptPath + '/eotlitetool.py ' + fontfile + '.ttf -o ' + fontfile + '.eot', shell=True)
  # subprocess.call('mv ' + fontfile + '.eotlite ' + fontfile + '.eot', shell=True)

  # Hint the TTF file
  subprocess.call('ttfautohint -s -f -n ' + fontfile + '.ttf ' + fontfile + '-hinted.ttf > /dev/null 2>&1 && mv ' + fontfile + '-hinted.ttf ' + fontfile + '.ttf', shell=True)

  build_data['icons'] = sorted(build_data['icons'], key=lambda k: k['name'])

  print "Save Build, Icons: %s" % ( len(build_data['icons']) )
  f = open(path.BUILD_DATA_PATH, 'w')
  f.write( json.dumps(build_data, indent=4, separators=(',', ': ')) )
  f.close()

