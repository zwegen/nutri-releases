Nutri Webapp

Start lokal im Browser am einfachsten mit einem kleinen HTTP-Server, z. B.:

cd /home/zwegen/Nutri/webapp
python3 -m http.server 8000

Dann im Browser öffnen:
http://localhost:8000

Hinweis:
Direktes Öffnen per file:// kann bei fetch() für JSON je nach Browser blockiert werden.
Darum besser mit kleinem lokalen Server starten.
