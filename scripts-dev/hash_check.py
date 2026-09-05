import hashlib, pathlib, sqlite3

central = pathlib.Path(r'C:\Users\wujue\.skills-manager\skills\bibigpt-account-registration')
skill_md = central / 'SKILL.md'

h = hashlib.sha256(skill_md.read_bytes()).hexdigest()
print('sha256(SKILL.md) =', h)
print('db content_hash =', '3144124262948571c5318541905ce656d8dcd8bd47d235e3b6687c387861a336')

# also check all files combined (maybe hash of dir listing)
import os
files = sorted([str(p.relative_to(central)) for p in central.rglob('*') if p.is_file()])
print('files:', files)
h2 = hashlib.sha256(''.join(files).encode()).hexdigest()
print('sha256(concat names) =', h2)
