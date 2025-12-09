export type DiarizationSegment = {
  speaker: string;
  start: number;
  end: number;
};

export type QuestionAnswer = {
  question: string;
  answer: string;
};

export type DatasetSample = {
  audio_id: string;
  language: string;
  duration: number;
  transcription: string;
  is_placeholder?: boolean;
  diarization: DiarizationSegment[];
  audio_event: string;
  paralinguistics: Record<string, unknown>;
  source: string;
  speech_source: {
    type: string;
    original_file: string;
    utterance_id: string;
  };
  nonspeech_source: {
    audio_event: string;
    source: string;
    original_file: string;
  };
  mixing_ratios: {
    speech: number;
    nonspeech: number;
  };
  question_answer_pair: QuestionAnswer[];
};

export const DATASET_SAMPLES: DatasetSample[] = [
  {
    audio_id: "audio_000001",
    language: "hindi",
    duration: 5.23,
  transcription: "इस मामले में कोर्ट द्वारा निर्देश दिया गया है",
  is_placeholder: false,
    diarization: [
      { speaker: "spk_0", start: 0.0, end: 2.6 },
      { speaker: "spk_1", start: 2.6, end: 5.23 },
    ],
    audio_event: "dog_bark",
    paralinguistics: {},
    source: "openslr_hindi+esc50",
    speech_source: {
      type: "openslr_hindi",
      original_file: "01-00005-02.wav",
      utterance_id: "01-00005-02",
    },
    nonspeech_source: {
      audio_event: "dog_bark",
      source: "esc50",
      original_file: "1-100032-A-0.wav",
    },
    mixing_ratios: {
      speech: 0.7,
      nonspeech: 0.3,
    },
    question_answer_pair: [
      {
        question: "What type of domain is the utterance talking about?",
        answer: "Legal / court proceedings",
      },
      {
        question: "What is the primary language?",
        answer: "Hindi",
      },
    ],
  },
  {
    audio_id: "audio_000002",
    language: "english",
    duration: 8.41,
  transcription: "The traffic signal at MG Road has been temporarily diverted.",
  is_placeholder: false,
    diarization: [
      { speaker: "announcer", start: 0.0, end: 6.5 },
      { speaker: "background", start: 0.0, end: 8.41 },
    ],
    audio_event: "car_horn",
    paralinguistics: {},
    source: "openslr_english+esc50",
    speech_source: {
      type: "openslr_english",
      original_file: "02-00110-01.wav",
      utterance_id: "02-00110-01",
    },
    nonspeech_source: {
      audio_event: "car_horn",
      source: "esc50",
      original_file: "2-157624-A-12.wav",
    },
    mixing_ratios: {
      speech: 0.6,
      nonspeech: 0.4,
    },
    question_answer_pair: [
      {
        question: "What is being described?",
        answer: "Diversion of traffic at MG Road signal",
      },
      {
        question: "Is there a non-speech acoustic event?",
        answer: "Yes, repeated car horns in the background.",
      },
    ],
  },
  {
    audio_id: "audio_000003",
    language: "tamil",
    duration: 4.02,
  transcription: "இன்று இரவு மழை பெய்யும் என்று வானிலை மையம் கூறியுள்ளது.",
  is_placeholder: false,
    diarization: [
      { speaker: "news_reader", start: 0.0, end: 4.02 },
    ],
    audio_event: "rain",
    paralinguistics: {},
    source: "openslr_tamil+esc50",
    speech_source: {
      type: "openslr_tamil",
      original_file: "03-00045-03.wav",
      utterance_id: "03-00045-03",
    },
    nonspeech_source: {
      audio_event: "rain",
      source: "esc50",
      original_file: "3-202345-B-4.wav",
    },
    mixing_ratios: {
      speech: 0.8,
      nonspeech: 0.2,
    },
    question_answer_pair: [
      {
        question: "What is the core information?",
        answer: "Weather center predicts rain tonight.",
      },
    ],
  },
  {
    audio_id: "audio_000004",
    language: "hinglish",
    duration: 6.75,
  transcription: "Railway station pe announcement thodi der ke liye delay ho gaya hai.",
  is_placeholder: false,
    diarization: [
      { speaker: "station_announce", start: 0.0, end: 4.0 },
      { speaker: "crowd", start: 0.0, end: 6.75 },
    ],
    audio_event: "station_announcement",
    paralinguistics: {},
    source: "custom_field+esc50",
    speech_source: {
      type: "field_recording",
      original_file: "field-rail-01.wav",
      utterance_id: "field-rail-01",
    },
    nonspeech_source: {
      audio_event: "crowd_noise",
      source: "esc50",
      original_file: "5-189345-C-2.wav",
    },
    mixing_ratios: {
      speech: 0.5,
      nonspeech: 0.5,
    },
    question_answer_pair: [
      {
        question: "Where is the recording located?",
        answer: "Inside a busy railway station.",
      },
      {
        question: "What is the speech content about?",
        answer: "Delay in public announcement for a short duration.",
      },
    ],
  },
];
