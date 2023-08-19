#[derive(Clone, Debug)]
pub enum Note {
    B,
    Bb,
    A,
    Ab,
    G,
    Gb,
    F,
    E,
    Eb,
    D,
    Db,
    C,
}

impl Note {
    fn from_string(string: &String) -> Option<Note> {
        return match string.clone().to_uppercase().as_str() {
            "B" => Some(Note::B),
            "A#" => Some(Note::Bb),
            "A" => Some(Note::A),
            "G#" => Some(Note::Ab),
            "G" => Some(Note::G),
            "F#" => Some(Note::Gb),
            "F" => Some(Note::F),
            "E" => Some(Note::E),
            "D#" => Some(Note::Eb),
            "D" => Some(Note::D),
            "C#" => Some(Note::Db),
            "C" => Some(Note::C),
            _ => None
        }
    }

    fn render(&self) -> String {
        let result  = match self {
            Note::B => "B",
            Note::Bb => "A#",
            Note::A => "A",
            Note::Ab => "G#",
            Note::G => "G",
            Note::Gb => "F#",
            Note::F => "F",
            Note::E => "E",
            Note::Eb => "D#",
            Note::D => "D",
            Note::Db => "C#",
            Note::C => "C",
        };
        return String::from(result);
    }
}

#[derive(Clone, Debug)]
pub enum ThirdInterval {
    Major,
    Minor,
}

#[derive(Clone, Debug)]
pub enum NoteChange {
    Seven
}


#[derive(Clone, Debug)]
pub struct Chord {
    base_note: Note,
    third_interval: ThirdInterval,
    change: Option<NoteChange>
}


impl Chord {
    pub fn from_string(string: &String) -> Option<Chord> {
        let mut string_clone =  string.clone();
        let change = if string.ends_with('7') {
            string_clone.pop();
            Some(NoteChange::Seven)
        } else {
            None
        };
        let first_char = string_clone.chars().nth(0)?;
        let third_interval = if first_char.is_lowercase() {
            ThirdInterval::Minor
        } else {
            ThirdInterval::Major
        };

        let base_note = Note::from_string(&string_clone)?;


        return Some(Chord {
            base_note,
            third_interval,
            change
        });
    }


    pub fn render(&self)->String {
        let mut result = match self.third_interval {
            ThirdInterval::Minor => self.base_note.render().to_lowercase(),
            ThirdInterval::Major => self.base_note.render().to_uppercase()
        };
        let postfix = match self.change {
            None => String::new(),
            Some(NoteChange::Seven) => String::from("7")
        };
        result.push_str(&postfix);
        return result;
    }

}
