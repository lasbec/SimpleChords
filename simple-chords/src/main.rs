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
    state.read_whitespace(); 
    let c = state.read_next();
    if c != Some('#') {
        panic!("Syntax Error: Expected the first non whitespace character to be '#' ")
    }
    let title = state.read_line().trim().to_string();
    state.push_to_result(AstElement::Heading(title))
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


fn parse_line(state: &mut ParsingState) {
    let chords_result = parse_line_of_chords(state);
    match chords_result {
        ChordsLineParsingResult::Consumed(s) => {
            let rest_line = state.read_line();
            let mut res = s.clone();
            res.push_str(&rest_line);
            state.push_to_result(AstElement::LyricLine(res));
        },
        ChordsLineParsingResult::Success(v) =>{
            for r in v {
                state.push_to_result(r);
            }
        }
    }
    state.read_next(); // consuming the lineending
}

#[derive(Clone, Debug)]
enum ChordsLineParsingResult {
    Success(Vec<AstElement>),
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
            result.push(AstElement::Chord(ChordToken {
                str:chord,
                start_char_index,
                start_line_index,
            }));
        } else {
            return ChordsLineParsingResult::Consumed(consumed);
        }
    }
    return ChordsLineParsingResult::Success(result);

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
        parse_line(state);
    }

    let song_output = state.result.iter().map(
        |el| {format!("{:?}\n", el)}).collect::<Vec<_>>().join(""
    );
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
