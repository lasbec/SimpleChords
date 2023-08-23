This Project is meant to serve a simple subset of Markdown to write songs with guitar chords.
Of course the core bit is to translate such files into Html or other richer formats.
The style is editable separatedly independet of the content.



Let's try to define the syntax grammar:

```
S ::= BlankLine* '#' WhiteSpace* Heading LineEnd BlankLine* ThreeTics Body
Body ::= (BlankLine* ChordLine TextLine)+ ThreeTics MetaInfo
MetaInfo ::= AnyText
ChordLine ::= EmptyChordsLine | ((WhiteSpace*  ( OptChord | Chord))+ WhiteSpace*)

EmptyChordsLine ::= '-' BlankLine
OptChord ::= '(' WhiteSpace* Chord WhiteSpace* ')'
AltChord ::= Chord WhiteSpace* '/' WhiteSpace* Chord
Chord


/* Helper */
ThreeTics = 3'`' WhiteSpace* LineEnd

BlankLine ::= WhiteSpace* | LineEnd
WhiteSpace ::= ' ' | '\t'
LineEnd ::= '\n'


```

