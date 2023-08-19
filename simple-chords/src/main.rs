use std::env;
use std::fs::File;
use std::io::{self, Write };
mod parsingstate;


type ParsingState = parsingstate::ParsingState<ChordToken>;

#[derive(Clone, Debug)]  
struct ChordToken {
    str: String,
    start_line_index: usize,
    start_char_index: usize
}

#[derive(Clone,Debug)]
struct HeadingToken {
    str: String
}



fn is_done(state: &mut ParsingState)-> bool {
    let next_char = state.peek();
    match next_char {
        None => true,
        _ => false
    }
}

fn skip_whitespace(state: &mut ParsingState) {
    if let Some(peek_char) = state.peek() {
        if !peek_char.is_whitespace() {
            return;
        }
        return skip_whitespace(state)
    }
}


fn read_line(state: &mut ParsingState) -> Option<String> {
    let mut c_opt = state.step_one_forward();
    if c_opt == None {
        return None;
    }
    
    let result_str = &mut String::new();
    while let Some(c) = c_opt {
        if c == '\n' { break };
        result_str.push(c);
        c_opt = state.step_one_forward();
    }
    return Some(result_str.clone());
}

fn parse_heading(state: &mut ParsingState) -> HeadingToken {
    skip_whitespace(state);
    let c = state.step_one_forward();
    if c != Some('#') {
        panic!("Syntax Error: Expected the first non whitespace character to be '#' ")
    }
    let title = read_line(state);
    return HeadingToken {
        str: title.unwrap_or(String::new()).trim().to_string()
    }
}


fn parse_line_of_chords(state: &mut ParsingState) {
    let mut current_chord:Option<ChordToken> = None;

    let mut char_opt = state.step_one_forward();
    while let Some(c) = char_opt {
        if c == '\n' { break }
        match (current_chord.clone(), c) {
            (None, ' ') | (None, '\n') => {},
            (None, c) => {
                current_chord = Some(ChordToken{
                    str: c.to_string(),
                    start_line_index: state.line_index(),
                    start_char_index: state.char_index() -1
                })
            }
            (Some(chord), ' ') | (Some(chord), '\n') => {
                state.push(chord);
                current_chord = None;
            },
            (Some(chord), c) => {
                let mut new_chord_str  = chord.str.clone();
                new_chord_str.push(c);
                current_chord = Some(ChordToken{
                    str: new_chord_str,
                    start_line_index: chord.start_line_index,
                    start_char_index: chord.start_char_index
                })
            }
        }
        char_opt = state.step_one_forward();
    };
}

fn parse_till_song_start(state: &mut ParsingState){
    skip_whitespace(state);
    let c0 = state.step_one_forward();
    let c1 = state.step_one_forward();
    let c2 = state.step_one_forward();
    let c3 = state.step_one_forward();
    if c0 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c1 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c2 != Some('`')  { panic!("Syntax Error: expected ``` (three tics) after heading.")};
    if c3 != Some('\n') { panic!("Syntax Error: new line after ``` (three tics).")};
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

    while !is_done(state) {
        parse_line_of_chords(state);
    }

    let song_output = state.result.iter().map(|chord| {format!("{:?}\n", chord)}).collect::<Vec<_>>().join("");
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
