# Transitions-Plan "Boxing"

## Zielsetzung

Es gibt Boxtypen:

- Box die keine Restriktionen erlaubt (die Primitive TextBox bspw.)
- Box die Restriktion der Breite und/oder höhe erlaubt

- Primitive Boxen
- Boxen höherer Ordnung (Higher Order Boxes, kurz HOB's), welche sich aus anderen Boxen zusammensetzen.

Die Restriktionen können folgender natur sein:

- exactWidth, exactHeight oder evtl. auch exactPages
- maxWidth / maxHeight oder evtl. auch maxPages

Die Höhe und Breite von HOB's wird automatisch (zur Laufzeit) berechnet.
Eine Prüfung der Restriktionen:

- findet nicht bei PrimitvenBoxen statt
- wird automatisch bei HOB's zur Laufzeit durchgefürt,
  sollte die Prüfung fehlschlagen wird ein BoxOverflow geschmissen.

HOB's welche Restriktionen entgegenenhmen können einen Callback tätigen, dass sie mehr Platz brauchen.
Statt einer Umbruchstrategie kann eine Box auch mit einem Overflowhandling gesetzt werden.

## ToDo's

- Remove width and hight attributes from Boxes (they are dynamically caclulated)
- Build a mechanism to measure the hight and width of a HOB by it's children
- extract drawToPdfPage for HOB's
- ~~Split placeing and drawing~~
- ~~Make PrimitveDir~~
