# What is it for

This Project is meant to serve a simple subset of Markdown to write songs with guitar chords.
Of course the core bit is to translate such files into Html or other richer formats.
The style should editable separatedly independet of the content.

I'm still looking for fonts that make it easy to distinguish guitar chords:

a e c C G b h

Candidates are:
Barricito
Macondo
Carter One
Shantell Sans

Making my onwn font with fontstruct

# Usage

## CLI

You can run this package from the commandline: `npx simple-chords <input_path> [<output_path>] [--debug]`

The **input_path** can be a path to a `.chords.md` file or a directory path.
If the path leads to a directory every file in it ending with `.chords.md` will be printed as Pdf.

The **output_path** is set a single pdf file with all songs will be printed.
Otherwise each file will be printed to it's own pdf file, the pdfs will be in the same directory as the input file.

Setting the debug flag will print the parsed ASTs, allow overflows and will draw Debugging Boxes into the output.

## As module

The `printPdfFiles` is the main exported funktion. It takes like the CLI Tool a parameterobject with three arguments:

```
printPdfFiles({
  inputPath: "~/my_songs/",
  outPath: "./Songs_for_the_bonfire.pdf",
  debug: false,
})
```

# Example Inputfile

````
# Dat du meen Leevsten büst

\```
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
\```

````
