# Synopsis

Convert your guitar chords stored in a textfile (`.chords.md`) into a formated PDF.

# What is it about?

Songs with guitar chords are often stored in text files or at least monofonts are used to display them.
This is because, if any character takes the same space it is pretty easy to position the chords, just by using space characters.

But when this text is copied into another program like Word the chords are likely to slide to the wrong position, because the font and format changes the spacing.
Therefore it is non trivial to format songs with chord information well.

So the idea of this project is to provide a tool that parses a text file
and outputs a well formated version of the provided song.

## Notes

I'm still looking for fonts that make it easy to distinguish guitar chords:

a e c C G b h

# Syntax

The syntax matches a subset of markdown,
such that everything is still readable and nice looking when opening with a markdown or text editor.
Therefore the File has to start with a `#` followed by the song title.
And the song itself must start and and with three ticks ` ``` ` (to tell markdown the block should be formatted as with a mono font)
Different sections are separated by brackets containing the type of the section.

# Example input file

````
# Dat du meen Leevsten büst

```
 C           G
Dat du min Leevsten büst,
 C           G
dat du woll weeßt.
[chorus]
    F                            C
|: Kumm bi de Nacht, kumm bi de Nacht,
 G          C
segg wo du heeßt. :|

[verse]
 C          G
Kumm du üm Middernacht,
 C            G
kumm du Klock een!
[chorus]
    F            C
|: Vader slöpt, Moder slöpt,
 G         C
ick slap aleen. :|

[]
 C           G
Klopp an de Kammerdör,
 C         G
fat an de Klink!
[chorus]
    F            C
|: Vader meent, Moder meent,
  G           C
 dat deit de Wind :|
```

````

# Usage

## As module

The `printPdfFiles` is the main exported function. It takes like the CLI Tool a parameterobject with three arguments:

```
printPdfFiles({
  inputPath: "~/my_songs/",
  outPath: "./Songs_for_the_bonfire.pdf",
  debug: false,
  style: dinA5Landscape
})
```

The **inputPath** can be a path or an array of paths to a `.chords.md` file or a directory path.
If the path leads to a directory every file in it ending with `.chords.md` will be printed as Pdf.

The **outPath** is set a single pdf file with all songs will be printed.
Otherwise each file will be printed to it's own pdf file, the pdfs will be in the same directory as the input file.

Setting the **debug** flag will print the parsed ASTs, allow overflows and will draw debugging boxes into the output.

The **style** argument is optional and has the following schema:

```typescript
const dinA5Landscape = {
  pageHeight: "148.5mm",
  pageWidth: "210mm",

  outerMargin: "5mm",
  innerMargin: "20mm",
  topMargin: "5mm",
  bottomMargin: "5mm",
  sectionDistance: "12pt",

  printPageNumbers: true,

  tableOfContents: "Glossary", // optional
  firstPage: "left" // optional

  lyricTextConfig: {
    font: "../fonts/CaterOne/CarterOne-Regular.ttf",
    fontSize: "11pt",
  },
  refTextConfig: {
    font: "Times-Roman",
    fontSize: "11pt",
  },
  chorusTextConfig: {
    font: pathToFontFile,
    fontSize: "11pt",
  },
  titleTextConfig: {
    fontSize: "13pt",
    font: pathToFontFile,
  },
  chordTextConfig: {
    font: "Times-BoldItalic",
    fontSize: "9pt",
  },

  // Due to ambigouties I descided for now to print Cb and A# and never any kind of B.
  // In future versions this will be configurable too.
  unifyChords: true, // optional will default to false.
};
```

Supported units are `"mm"` and `"pt"`.
The following fonts are built in:

```typescript
'Courier',
'Courier-Bold',
'Courier-Oblique',
'Courier-BoldOblique',
'Helvetica',
'Helvetica-Bold',
'Helvetica-Oblique',
'Helvetica-BoldOblique',
'Times-Roman',
'Times-Bold',
'Times-Italic',
'Times-BoldItalic',
'Symbol',
'ZapfDingbats',
```

## CLI

You can run this package from the command line too: `npx simple-chords <input_path> [<...further_inputPaths>[] <output_path>] [--theme <path_to_json>] [--debug]`
