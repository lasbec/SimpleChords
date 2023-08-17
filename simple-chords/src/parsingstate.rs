use std::fs::File;
use std::io::{self, BufRead, BufReader, Write };

struct Cursor {
    line_index: usize,
    char_index: usize,
    total_index: usize
}


pub struct ParsingState<T> {
    cursor: Cursor,
    remaining: Box<dyn Iterator<Item=char>>,
    peek: Option<char>,
    pub result: Vec<T>
}

pub fn init_parsing_for_file<T>(input_path: &String) -> io::Result<ParsingState<T>> {
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


pub fn peek<T>(state: &ParsingState<T>) -> Option<char> {
    return state.peek;
}

pub fn line_index<T>(state: &ParsingState<T>) -> usize {
    return state.cursor.line_index
}

pub fn char_index<T>(state: &ParsingState<T>) -> usize {
    return state.cursor.char_index
}

pub fn push<T>(state: &mut ParsingState<T>, element: T) {
    state.result.push(element);
}

pub fn step_one_forward<T>(state: &mut ParsingState<T>) -> Option<char> {
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
