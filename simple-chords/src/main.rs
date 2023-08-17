use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Write };

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

struct Cursor {
    line_index: usize,
    char_index: usize,
    total_index: usize
}

struct ParsingState {
    cursor: Cursor,
    remaining: Box<dyn Iterator<Item=char>>,
    peek: Option<char>,
    result: Vec<ChordToken>
    
}

fn is_done(state: &mut ParsingState)-> bool {
    let next_char = state.peek;
    match next_char {
        None => true,
        _ => false
    }
}


fn step_one_forward(state: &mut ParsingState) -> Option<char> {
    let result = state.peek;
    state.peek = state.remaining.next();
    match result {
        Some('\n') => {
            state.cursor.total_index += 1;
            state.cursor.line_index += 1;
            state.cursor.char_index = 0;
        },
        Some(_) =>  {
            state.cursor.total_index += 1;
            state.cursor.char_index += 1;
        },
        None => {},
    }
    return result;
}

fn skip_whitespace(state: &mut ParsingState) {
    if let Some(peek_char) = state.peek {
        if !peek_char.is_whitespace() {
            return;
        }
        return skip_whitespace(state)
    }
}

fn read_line(state: &mut ParsingState) -> Option<String> {
    let mut c_opt = step_one_forward(state);
    if c_opt == None {
        return None;
    }
    
    let result_str = &mut String::new();
    while let Some(c) = c_opt {
        if c == '\n' { break };
        result_str.push(c);
        c_opt = step_one_forward(state);
    }
    return Some(result_str.clone());
}

fn parse_heading(state: &mut ParsingState) -> HeadingToken {
    skip_whitespace(state);
    let c = step_one_forward(state);
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

    let mut char_opt = step_one_forward(state);
    while let Some(c) = char_opt {
        if c == '\n' { break }
        match (current_chord.clone(), c) {
            (None, ' ') | (None, '\n') => {},
            (None, c) => {
                current_chord = Some(ChordToken{
                    str: c.to_string(),
                    start_line_index: state.cursor.line_index,
                    start_char_index: state.cursor.char_index -1
                })
            }
            (Some(chord), ' ') | (Some(chord), '\n') => {
                state.result.push(chord);
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
        char_opt = step_one_forward(state)
    };
}


fn init_parsing(input_path: &String) -> io::Result<ParsingState> {
    let input_file = File::open(input_path)?;
    let input_reader = BufReader::new(input_file);


    let mut char_iter = Box::new(input_reader.lines().flat_map(|line_res| {
        let line = line_res.unwrap_or(String::new());
        let char_iter = line.chars();
        return char_iter.chain("\n".chars()).collect::<Vec<_>>();
    }));
    let peek = char_iter.next();
    

    return Ok(ParsingState {
        cursor: Cursor { line_index: 0, char_index: 0, total_index: 0 },
        remaining: char_iter,
        peek: peek,
        result: vec![]
    });   
}

fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        eprintln!("Usage: {} <input_file> <output_file>", args[0]);
        return Ok(());
    }
    let input_path = &args[1];

    let state = &mut init_parsing(input_path)?;
    

    let heading = parse_heading(state);

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
