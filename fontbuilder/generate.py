from subprocess import call
import os
import json


BUILDER_PATH = os.path.dirname(os.path.abspath(__file__))
ROOT_PATH = os.path.join(BUILDER_PATH, '..', '..')
FONTS_FOLDER_PATH = os.path.join(BUILDER_PATH, '..', 'dist', 'fonts')
SCSS_FOLDER_PATH = os.path.join(BUILDER_PATH, '..', 'src', 'scss', 'mobile', 'components')


def main():
  generate_font_files()

  data = get_build_data()

  rename_svg_glyph_names(data)
  generate_scss(data)
  generate_cheatsheet(data)


def generate_font_files():
  print "Generate Fonts"
  cmd = "fontforge -script %s/scripts/generate_font.py" % (BUILDER_PATH)
  call(cmd, shell=True)


def rename_svg_glyph_names(data):
  # hacky and slow (but safe) way to rename glyph-name attributes
  svg_path = os.path.join(FONTS_FOLDER_PATH, data['font_name'] + '.svg')
  svg_file = open(svg_path, 'r+')
  svg_text = svg_file.read()
  svg_file.seek(0)

  for icon in data['icons']:
    # uniF2CA
    org_name = 'uni%s' % (icon['code'].replace('0x', '').upper())
    icon_name = '%s-%s' % (data['class_name'], icon['name'])
    svg_text = svg_text.replace(org_name, icon_name)

  svg_file.write(svg_text)
  svg_file.close()


def generate_scss(data):
  print "Generate SCSS"
  build_hash = data['build_hash']
  font_name = data['font_name']
  css_class = data['class_name']
  icons_file_path = os.path.join(SCSS_FOLDER_PATH, '_icons.scss')

  d = []
  d.append('@import "global";\n')
  d.append('//')
  d.append('// @variables')
  d.append('//')
  d.append('$include-html-icons-classes: $include-html-classes !default;\n')
  d.append('$icons-hash: "%s" !default;' % (build_hash) )
  d.append('$icons-font-path: "../fonts" !default;')
  d.append('$icons-font-family: "%s" !default;' % (font_name) )
  d.append('$icons-class: "%s" !default;\n' % (css_class) )
  for icon in data['icons']:
    chr_code = icon['code'].replace('0x', '\\')
    d.append('$icon-%s: "%s";' % (icon['name'], chr_code) )
  d.append('\n@include exports("icons") {')
  d.append('    @if $include-html-icons-classes {')
  d.append('        /* Icons */')
  d.append('        @font-face {')
  d.append('            font-family: $icons-font-family;')
  d.append('            src: url("#{$icons-font-path}/%s.woff?v=#{$icons-hash}") format("woff"),' % (font_name))
  d.append('                url("#{$icons-font-path}/%s.ttf?v=#{$icons-hash}") format("truetype"),' % (font_name))
  d.append('                url("#{$icons-font-path}/%s.svg?v=#{$icons-hash}#svg") format("svg");' % (font_name))
  d.append('            font-weight: 400;')
  d.append('            font-style: normal;')
  d.append('        }\n')
  d.append('        .#{$icons-class}::before {')
  d.append('            display: inline-block;')
  d.append('            min-width: 1em;')
  d.append('            vertical-align: 0;')
  d.append('            line-height: 1;')
  d.append('            font-family: $icons-font-family;')
  d.append('            font-variant: normal;')
  d.append('            -webkit-font-smoothing: antialiased;')
  d.append('            text-transform: none;')
  d.append('            text-rendering: auto;')
  d.append('            speak: none;')
  d.append('        }\n')

  d.append('        // Icons')
  group = [] #[ '.%s' % (data['font_name'].lower()) ]
  for icon in data['icons']:
    group.append('        .#{$icons-class}-%s' % (icon['name']))

  d.append(',\n'.join(group) + ' { @extend .#{$icons-class}; }')

  for icon in data['icons']:
    chr_code = icon['code'].replace('0x', '\\')
    d.append('        .#{$icons-class}-%s::before { content: $icon-%s; }' % (icon['name'], icon['name']) )

  d.append('    }')
  d.append('}')

  f = open(icons_file_path, 'w')
  f.write( '\n'.join(d) )
  f.close()


def generate_cheatsheet(data):
  print "Generate Cheatsheet"

  cheatsheet_file_path = os.path.join(BUILDER_PATH, '..', 'docs', 'iconfonts.html')
  template_path = os.path.join(BUILDER_PATH, 'cheatsheet', 'template.html')
  icon_row_path = os.path.join(BUILDER_PATH, 'cheatsheet', 'icon-row.html')

  f = open(template_path, 'r')
  template_html = f.read()
  f.close()

  f = open(icon_row_path, 'r')
  icon_row_template = f.read()
  f.close()

  content = []

  for icon in data['icons']:
    css_code = icon['code'].replace('0x', '\\')
    escaped_html_code = icon['code'].replace('0x', '&amp;#x') + ';'
    html_code = icon['code'].replace('0x', '&#x') + ';'
    item_row = icon_row_template

    item_row = item_row.replace('{{name}}', icon['name'])
    item_row = item_row.replace('{{class}}', data['class_name'])
    item_row = item_row.replace('{{css_code}}', css_code)
    item_row = item_row.replace('{{escaped_html_code}}', escaped_html_code)
    item_row = item_row.replace('{{html_code}}', html_code)

    content.append(item_row)

  template_html = template_html.replace('{{font_name}}', data['font_name'])
  template_html = template_html.replace('{{icon_count}}', str(len(data['icons'])) )
  template_html = template_html.replace('{{class}}', data['class_name'])
  template_html = template_html.replace('{{content}}', '\n'.join(content) )

  f = open(cheatsheet_file_path, 'w')
  f.write(template_html)
  f.close()


def get_build_data():
  build_data_path = os.path.join(BUILDER_PATH, 'build_data.json')
  f = open(build_data_path, 'r')
  data = json.loads(f.read())
  f.close()
  return data


if __name__ == "__main__":
  main()
