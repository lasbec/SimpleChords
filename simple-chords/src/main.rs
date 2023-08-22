use std::env;
use std::fs::File;
use std::io::{self, Write };
use std::path::PathBuf;

use music::Chord;
mod parsingstate;
mod music;

#[derive(Clone, Debug)]  
enum Token {
    Heading(String),
    Markup(String),
    ChordLine(Vec<ChordToken>),
    LyricLine(String)
}   

type ParsingState = parsingstate::ParsingState<Token>;

#[derive(Clone, Debug)]  
struct ChordToken {
    chord: Chord,
    start_line_index: usize,
    start_char_index: usize
}



fn parse_heading(state: &mut ParsingState) {
    state.read_whitespace(); 
    let c = state.read_next();
    if c != Some('#') {
        panic!("Syntax Error: Expected the first non whitespace character to be '#' ")
    }
    let title = state.read_line().trim().to_string();
    state.push_to_result(Token::Heading(title))
}

fn parse_till_song_start(state: &mut ParsingState){
    state.read_whitespace();
    let c0 = state.read_next();
    let c1 = state.read_next();
    let c2 = state.read_next();
    let c3 = state.read_next();
    if c0 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c1 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c2 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c3 != Some('\n') { panic!("Syntax Error: new line expected after ``` (three tics).")};
}


fn parse_song(state: &mut ParsingState) {
    parse_till_song_start(state);
    while !state.is_done() {
        // check for end of block
        if state.peek() == Some('`') {
            let c0 = state.read_next();
            let c1 = state.read_next();
            let c2 = state.read_next();
            let c3 = state.read_next();
            if c0 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) to end the song.")};
            if c1 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) to end the song.")};
            if c2 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) to end the song.")};
            if c3 != Some('\n') { panic!("Syntax Error: new line expected after ``` (three tics).")};
            return;
        } 
        parse_line(state);
    }
}

fn parse_line(state: &mut ParsingState) {
    if state.peek() == Some('[') {
         parse_markup_line(state); 
    } else {
        let chords_result = parse_line_of_chords(state);
        match chords_result {
            ChordsLineParsingResult::Consumed(s) => {
                let rest_line = state.read_line();
                let mut res = s.clone();
                res.push_str(&rest_line);
                state.push_to_result(Token::LyricLine(res));
            },
            ChordsLineParsingResult::Success(v) =>{
                if !v.is_empty() {
                    state.push_to_result(Token::ChordLine(v));
                }
            }
        }
    }
    state.read_next(); // consuming the lineending
}

fn parse_markup_line(state: &mut ParsingState) {
    state.read_next(); // shoud be '['
    let result = state.read_till(|c| c == ']');
    state.push_to_result(Token::Markup(result));
}

#[derive(Clone, Debug)]
enum ChordsLineParsingResult {
    Success(Vec<ChordToken>),
    Consumed(String)
}

fn parse_line_of_chords(state: &mut ParsingState) -> ChordsLineParsingResult {
    let mut result = Vec::new();
    let mut consumed = String::new();


    
     while state.peek() != Some('\n') && !state.peek().is_none() { 
        let pre_whitespace = state.read_whitespace_but_not_linebreak(); 
        consumed.push_str(&pre_whitespace);

        let start_line_index = state.line_index();
        let start_char_index = state.char_index();

        let candidate = state.read_till_whitespace();
        if candidate.is_empty() {break};
        consumed.push_str(&candidate);

        let chord_opt = Chord::from_string(&candidate);
        if let Some(chord) = chord_opt {
            result.push(ChordToken {
                chord,
                start_char_index,
                start_line_index,
            });
        } else {
            return ChordsLineParsingResult::Consumed(consumed);
        }
    }
    return ChordsLineParsingResult::Success(result);

}


#[derive(Clone, Debug)]
struct AST {
    heading: String,
    song: Vec<SongSection>
}

#[derive(Clone, Debug)]
struct SongSection {
    markup: String,
    lines: Vec<SongBar>
}

type SongBar = Vec<SongLineChar>;


#[derive(Clone, Debug)]
struct SongLineChar {
    char: char,
    chord: Option<Chord>
}

fn chords_to_song_line(chords: &Vec<ChordToken>) -> SongBar {
    let mut result = Vec::new();
    for chord in chords {
        result.push(SongLineChar{
            char: ' ',
            chord: Some(chord.chord.clone())
        })
    }
    return result;
}

fn lyric_to_songline(lyrics:&String)->SongBar {
    let mut result = Vec::new();
    for c in lyrics.chars() {
        result.push(SongLineChar { char: c, chord: None })
    }
    return result;
}

fn make_song_line(lyrics: &String, chords:&Vec<ChordToken>) -> SongBar {
    let mut result = Vec::new();
    let mut chords_iter = chords.iter();
    let mut next_chord = chords_iter.next();
    for (i,c) in lyrics.chars().enumerate() {
        if let Some(nc) = next_chord {
            if nc.start_char_index == i {
                result.push(SongLineChar { char: c, chord: Some(nc.chord.clone()) });
                next_chord = chords_iter.next();
                continue;
            }
        }
        result.push(SongLineChar { char: c, chord: None })
    }
    return result;
}




fn build_ast(tokens: Vec<Token>) -> AST {
    let mut token_iterator = tokens.iter();

    let mut heading = String::new();
    let mut sections: Vec<SongSection> = Vec::new();
    let mut current_section = SongSection {
        markup: String::new(),
        lines: Vec::new()
    };

    let mut current_chords = None;
    
    while let Some(token) = token_iterator.next() {
        match token {
            Token::ChordLine(chords) => {
                if let Some(cc) = current_chords {
                    let value:SongBar = chords_to_song_line(cc);
                    current_section.lines.push(value);
                } 
                current_chords = Some(chords);
            },
            Token::LyricLine(lyrics) => {
                if let Some(cc) = current_chords {
                    let value = make_song_line(lyrics, cc);
                    current_section.lines.push(value);
                    current_chords = None;
                } else {
                    let value = lyric_to_songline(lyrics);
                    current_section.lines.push(value)
                }
            },
            Token::Markup(section_name) => {
                sections.push(current_section);
                current_section = SongSection {
                    markup: section_name.clone(),
                    lines: Vec::new()
                }
            },
            Token::Heading(h) => {
                heading = h.clone();
            }
        }
    }
    sections.push(current_section);
    return AST {
        heading: heading.clone(),
        song: sections
    }

}


fn song_bar_to_html(line: SongBar) -> String {
    let mut result = String::new();
    let mut previos_char = None;
    for c in line {
        result.push(c.char);
        if let Some(chord) = c.chord {
            let above_space_class = if c.char.is_whitespace() && previos_char.unwrap_or('a').is_whitespace() {
                " class='above-whitespace'"
            } else {
                " class='above-visible'"
            };
            let chord_tag = format!("<chord{}>{}</chord>",above_space_class,chord.render());
            result.push_str(&chord_tag);
        }
        previos_char = Some(c.char);
    }
    return format!("<span class='bar'>{}</span> ",result);
}

fn make_string_html_class_conform(string: &String) -> String {
    return string.replace(' ', "_").to_ascii_lowercase();
}

fn section_to_html(sec: SongSection) -> String {
    let mut lines_str = String::new();
    for line in sec.lines {
        lines_str.push_str(&song_bar_to_html(line));
    }

    return format!("
        <p  class='{}'>
            {} 
        </p>", make_string_html_class_conform(&sec.markup), lines_str);
}

fn ast_to_html(ast: AST) -> String{
    let mut sections_str = String::new();
    for sec in ast.song {
        sections_str.push_str(&section_to_html(sec))
    }

    return format!("<!DOCTYPE html>
<html>
<head>
    <link rel='stylesheet' href='SimpleChords.css'>
</head>
<body>
    <h1>{}</h1>
    {}
</body>",
    ast.heading,
    sections_str)
}


fn translate_file(input_path: &String) -> io::Result<()> {
    let state = &mut parsingstate::ParsingState::from_file(input_path)?;
    

    parse_heading(state); 
    parse_song(state);

    let ast = build_ast(state.result.clone());
    let html = ast_to_html(ast);
    let mut output = html;

    // Open the output file
    let mut path = PathBuf::from(input_path);
    path.set_extension("html");
    let output_path = path.to_string_lossy().to_string();
    
    let mut output_file = File::create(output_path.clone())?;

    // Write the line count to the output file
    writeln!(output_file, "{}", output)?;

    println!("Output written to {} successfully.", output_path);

    Ok(())
}

fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        println!("Takes only one argument");
        return Ok(());
    }

    let input_path = &args[1];

    if input_path.ends_with(".chords.md") {
        return translate_file(input_path);
    }

    let paths = std::fs::read_dir(input_path)?;

    for path_res in paths {
        let _path = &path_res.unwrap().path();
        let path = _path.as_os_str().to_str().unwrap();
        if path.ends_with(".chords.md") {
            println!("Start processing {}.", path);
            translate_file(&path.to_string())?;
        }
    }

    Ok(())
}
