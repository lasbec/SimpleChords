use std::env;
use std::fs::File;
use std::io::{self, Write };
mod parsingstate;

#[derive(Clone, Debug)]  
enum AstElement {
    Heading(String),
    Chord(ChordToken),
    LyricLine(String)
}   

type ParsingState = parsingstate::ParsingState<AstElement>;

#[derive(Clone, Debug)]  
struct ChordToken {
    str: String,
    start_line_index: usize,
    start_char_index: usize
}



fn parse_heading(state: &mut ParsingState) {
    state.skip_whitespace(); 
    let c = state.step_one_forward();
    if c != Some('#') {
        panic!("Syntax Error: Expected the first non whitespace character to be '#' ")
    }
    let title = state.read_line().unwrap_or(String::new()).trim().to_string();
    state.push_to_result(AstElement::Heading(title))
}

fn parse_till_song_start(state: &mut ParsingState){
    state.skip_whitespace();
    let c0 = state.step_one_forward();
    let c1 = state.step_one_forward();
    let c2 = state.step_one_forward();
    let c3 = state.step_one_forward();
    if c0 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c1 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c2 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c3 != Some('\n') { panic!("Syntax Error: new line after ``` (three tics).")};
}


fn parse_line_of_chords(state: &mut ParsingState) {
    let mut peeked_char = state.peek();
    while peeked_char != Some('\n') {
        parse_chord(state);
        peeked_char = state.peek();
    }
}

fn parse_chord(state: &mut ParsingState){
    state.skip_whitespace();
    let start_line_index = state.line_index();
    let start_char_index = state.char_index();

    let mut result_str = String::new();

    let mut char_opt = state.peek();
    while let Some(c) = char_opt {
        if c.is_whitespace() { break }
        result_str.push(c);
        state.step_one_forward();
        char_opt = state.peek();

    }

    state.push_to_result(AstElement::Chord(ChordToken { str: result_str, start_line_index, start_char_index }))
}

fn parse_lyrics_line(state: &mut ParsingState){
    let lyric = state.read_line().unwrap_or(String::new());
    state.push_to_result(AstElement::LyricLine(lyric))
}


fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        eprintln!("Usage: {} <input_file> <output_file>", args[0]);
        return Ok(());
    }
    let input_path = &args[1];

    let state = &mut parsingstate::ParsingState::init_parsing_for_file(input_path)?;
    

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
