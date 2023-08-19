use std::fs::File;
use std::io::{self, BufRead, BufReader };

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

impl<T> ParsingState<T> {
    pub fn init_parsing_for_file(input_path: &String) -> io::Result<ParsingState<T>> {
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


    pub fn peek(&self) -> Option<char> {
        return self.peek;
    }

    pub fn line_index(&self) -> usize {
        return self.cursor.line_index
    }

    pub fn char_index(&self) -> usize {
        return self.cursor.char_index
    }

    pub fn push_to_result(&mut self, element: T) {
        self.result.push(element);
    }

    pub fn step_one_forward(& mut self) -> Option<char> {
        let result = self.peek;
        self.peek = self.remaining.next();
        match result {
            Some('\n') => {
                self.cursor.total_index += 1;
                self.cursor.line_index += 1;
                self.cursor.char_index = 0;
            },
            Some(_) =>  {
                self.cursor.total_index += 1;
                self.cursor.char_index += 1;
            },
            None => {},
        }
        return result;
    }
    // --------------------------------------------------------
    // Second level methods
    // --------------------------------------------------------

    pub fn is_done(&mut self)-> bool {
        let next_char = self.peek();
        match next_char {
            None => true,
            _ => false
        }
    }
    
    pub fn skip_whitespace(&mut self) {
        if let Some(peek_char) = self.peek() {
            if !peek_char.is_whitespace() {
                return;
            }
            return self.skip_whitespace()
        }
    }
    
    
    pub fn read_line(&mut self) -> Option<String> {
        let mut c_opt = self.step_one_forward();
        if c_opt == None {
            return None;
        }
        
        let result_str = &mut String::new();
        while let Some(c) = c_opt {
            if c == '\n' { break };
            result_str.push(c);
            c_opt = self.step_one_forward();
        }
        return Some(result_str.clone());
    }
}