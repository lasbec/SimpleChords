use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Write};

#[derive(Clone, Debug)]  
struct ChordToken {
    str: String,
    start_line_index: usize,
    start_char_index: usize
}

fn parse_chord_tokens(input: impl Iterator<Item =char>) -> String {
    let mut output: String = String::new();

    let mut current_chord:Option<ChordToken> = None;

    let mut line_index = 0;
    let mut c_index = 0;

    for c in input {
        match (current_chord.clone(), c) {
            (None, ' ') | (None, '\n') => println!("Nothing"),
            (None, c) => {
                println!("N, c: {}", c);
                current_chord = Some(ChordToken{
                    str: c.to_string(),
                    start_line_index: line_index,
                    start_char_index: c_index
                })
            }
            (Some(chord), ' ') | (Some(chord), '\n') => {
                println!("chord: {:?}, c", chord);
                output.push_str(format!("{:?}",chord).as_str());
                current_chord = None;
            },
            (Some(chord), c) => {
                println!("chord: {:?}, c :{}", chord, c);
                let mut new_chord_str  = chord.str.clone();
                new_chord_str.push(c);
                current_chord = Some(ChordToken{
                    str: new_chord_str,
                    start_line_index: line_index,
                    start_char_index: c_index
                })
            }
        }
        line_index += 1;
        c_index += 1;
    }
    return output;
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


    let char_iter = input_reader.lines().flat_map(|line_res| {
        let line = line_res.unwrap_or(String::new());
        let mut char_iter = line.chars();
        return char_iter.chain("\n".chars()).collect::<Vec<_>>();
    });
    
    let output = parse_chord_tokens(char_iter);


    // Open the output file
    let output_path = &args[2];
    let mut output_file = File::create(output_path)?;

    // Write the line count to the output file
    writeln!(output_file, "{}", output)?;

    println!("Line count written to {} successfully.", output_path);

    Ok(())
}
