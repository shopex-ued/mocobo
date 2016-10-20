import os

BUILDER_PATH = os.path.dirname(os.path.abspath(__file__))
MANIFEST_PATH = os.path.join(BUILDER_PATH, 'manifest.json')
BUILD_DATA_PATH = os.path.join(BUILDER_PATH, 'build_data.json')
SCRIPT_PATH = os.path.join(BUILDER_PATH, 'scripts')
INPUT_SVG_DIR = os.path.join(BUILDER_PATH, 'icons')
TEMPLATE_PATH = os.path.join(BUILDER_PATH, 'cheatsheet', 'template.html')
ICON_ROW_PATH = os.path.join(BUILDER_PATH, 'cheatsheet', 'icon-row.html')
CHEATSHEET_PATH = os.path.join(BUILDER_PATH, '..', 'docs', 'iconfonts.html')
OUTPUT_FONT_DIR = os.path.join(BUILDER_PATH, '..', 'dist', 'fonts')
OUTPUT_SCSS_DIR = os.path.join(BUILDER_PATH, '..', 'src', 'scss', 'components')
