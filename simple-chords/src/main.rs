use std::env;
use std::fs::File;
use std::io::{self, Write };

use music::Chord;
mod parsingstate;
mod music;

#[derive(Clone, Debug)]  
enum AstElement {
    Heading(String),
    Chord(ChordToken),
    LyricLine(String)
}   

type ParsingState = parsingstate::ParsingState<AstElement>;

#[derive(Clone, Debug)]  
struct ChordToken {
    str: Chord,
    start_line_index: usize,
    start_char_index: usize
}



fn parse_heading(state: &mut ParsingState) {
    state.skip_whitespace(); 
    let c = state.read_next();
    if c != Some('#') {
        panic!("Syntax Error: Expected the first non whitespace character to be '#' ")
    }
    let title = state.read_line().unwrap_or(String::new()).trim().to_string();
    state.push_to_result(AstElement::Heading(title))
}

fn parse_till_song_start(state: &mut ParsingState){
    state.skip_whitespace();
    let c0 = state.read_next();
    let c1 = state.read_next();
    let c2 = state.read_next();
    let c3 = state.read_next();
    if c0 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c1 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c2 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c3 != Some('\n') { panic!("Syntax Error: new line expected after ``` (three tics).")};
}


fn parse_line_of_chords(state: &mut ParsingState) {
    state.skip_whitespace_but_not_linebreak();

    while !state.is_done() {
        let last_read_chord = read_chord(state);
        state.skip_whitespace_but_not_linebreak();
        let peek = state.peek(); 
        let next_char_is_linebreak = peek == Some('\n'); 


        if next_char_is_linebreak {
            state.read_next();
        }

        if let Some(chord) = last_read_chord {
            state.push_to_result(AstElement::Chord(chord));
            if next_char_is_linebreak { break; }
        }
    }
}

fn read_chord(state: &mut ParsingState) -> Option<ChordToken> {
    let start_line_index = state.line_index();
    let start_char_index = state.char_index();

    let read_str = state.read_till_whitespace();
    if read_str.is_empty() { return None }
    let chord_opt = Chord::from_string(&read_str);
    let chord = chord_opt.expect(format!("Syntax Error: Expected a chord but got '{}'", read_str).as_str());
 
    return Some(ChordToken { str: chord, start_line_index, start_char_index })
}

fn parse_lyrics_line(state: &mut ParsingState){
    let lyric = state.read_line().unwrap_or(String::new());
    state.push_to_result(AstElement::LyricLine(lyric))
}


fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        return Ok(());
    }
    let input_path = &args[1];

    let state = &mut parsingstate::ParsingState::from_file(input_path)?;
    

    let heading = parse_heading(state);

    parse_till_song_start(state);
 
    while !state.is_done() {
        parse_line_of_chords(state);
        parse_lyrics_line(state);
    }

    let song_output = state.result.iter().map(|el| {format!("{:?}\n", el)}).collect::<Vec<_>>().join("");
    let mut output = format!("{:?}",heading);
    output.push('\n');
    output.push_str(&song_output);


    // Open the output file
    let output_path = &args[2];
    let mut output_file = File::create(output_path)?;

    // Write the line count to the output file
    writeln!(output_file, "{}", output)?;

    println!("Output written to {} successfully.", output_path);

    Ok(())
}
