use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Write };

#[derive(Clone, Debug)]  
struct ChordToken {
    str: String,
    start_line_index: usize,
    start_char_index: usize
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
        Some(c) =>  {
            state.cursor.total_index += 1;
            state.cursor.char_index += 1;
        },
        None => {},
    }
    return result;
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




fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        eprintln!("Usage: {} <input_file> <output_file>", args[0]);
        return Ok(());
    }

    // Open the input file
    let input_path = &args[1];
    let input_file = File::open(input_path)?;
    let input_reader = BufReader::new(input_file);


    let mut char_iter = Box::new(input_reader.lines().flat_map(|line_res| {
        let line = line_res.unwrap_or(String::new());
        let mut char_iter = line.chars();
        return char_iter.chain("\n".chars()).collect::<Vec<_>>();
    }));
    let peek = char_iter.next();
    

    let state = &mut ParsingState {
        cursor: Cursor { line_index: 0, char_index: 0, total_index: 0 },
        remaining: char_iter,
        peek: peek,
        result: vec![]
    };

    while(! is_done(state)){
        parse_line_of_chords(state);
    }

    let output = state.result.iter().map(|chord| {format!("{:?}\n", chord)}).collect::<Vec<_>>().join("");


    // Open the output file
    let output_path = &args[2];
    let mut output_file = File::create(output_path)?;

    // Write the line count to the output file
    writeln!(output_file, "{}", output)?;

    println!("Output written to {} successfully.", output_path);

    Ok(())
}
