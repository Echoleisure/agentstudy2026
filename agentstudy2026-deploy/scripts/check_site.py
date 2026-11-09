#!/usr/bin/env python3
"""Static-site release checks; only Python stdlib required."""
import json
from pathlib import Path
import re
import zipfile

root=Path(__file__).resolve().parents[1]
s=(root/'data.js').read_text(encoding='utf-8')
assert s.startswith('window.AGENT_QA_DATA = ')
d=json.loads(s.split('=',1)[1].strip().rstrip(';'))
assert len(d['courses'])==9 and len({c['id'] for c in d['courses']})==9
assert len(d['questions'])==80 and len({q['id'] for q in d['questions']})==80
assert len(d['metrics'])==24 and len(d['followups'])==30
assert len(d['chapters'])==7
for c in d['courses']:
 assert c['title'] and c['one'] and c['check']
for q in d['questions']:
 assert q['question'] and q['answer'] and q['follow']
for m in d['metrics']:
 assert m['name'] and m['formula'] and m['source'] and m['pitfall']
for fn in ['index.html','app.js','data.js','styles.css','assets/favicon.svg','assets/agent-qa-pytest-lab.zip','README.md','DEPLOY.md','.nojekyll']:
 assert (root/fn).is_file(), fn
html=(root/'index.html').read_text(encoding='utf-8')
for path in ['styles.css','data.js','app.js','assets/favicon.svg']:
 assert path in html
js=(root/'app.js').read_text(encoding='utf-8')
for path in re.findall(r'href="(assets/[^" ]+)"',js):
 assert (root/path).is_file(),path
for name in ['data.js','scripts/content_source.py','scripts/generate_data.py','app.js']:
 t=(root/name).read_text(encoding='utf-8').lower()
 for secret in ['prod-boson','boson-worker','sensecore','zhanglingfei','毕设','硕士','私人仓库部署']:
  assert secret.lower() not in t,(name,secret)
with zipfile.ZipFile(root/'assets/agent-qa-pytest-lab.zip') as z:
 assert z.testzip() is None
 for f in z.namelist():
  if not f.endswith(('.py','.md','.json','.txt','.yaml','.yml')):continue
  txt=z.read(f).decode('utf-8',errors='replace').lower()
  assert 'prod-boson' not in txt and 'sensecore' not in txt and 'zhanglingfei' not in txt
print('PASS: all site datasets, links, asset zip, and public-content checks')
