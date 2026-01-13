
# Audio Language Model (ALM)
### Edge-Native Offline Surveillance & Intelligence System  

**Winner – Smart India Hackathon (SIH)**  
**Ministry:** Ministry of Defence (DRDO)  
**Organizing Body:** AICTE  

---

## Overview

**Audio Language Model (ALM)** is a **fully offline, edge-native surveillance and audio intelligence system** engineered for deployment in **high-security and mission-critical environments** such as airports, railway stations, hospitals, public infrastructure, and defence installations.

The system is designed to operate **entirely without cloud connectivity**, ensuring strict compliance with data privacy, national security, and operational reliability requirements. ALM processes complex acoustic environments in real time, extracting speech, speaker intent, non-verbal cues, and environmental context to generate **actionable intelligence** for security personnel and operators.

Key design principles include:
- **Complete data sovereignty**
- **Low-latency edge inference**
- **Robust operation in disconnected or restricted networks**
- **Scalable edge-to-dashboard architecture**

---

## Core Capabilities

ALM is architected around two tightly-coupled intelligence layers.

---

## Audio Processing Module

This module is responsible for converting raw audio streams into structured, machine-understandable signals.

- **Multilingual Speech Transcription**  
  Real-time conversion of spoken audio into text across multiple Indic and global languages.

- **Language Translation & Normalization**  
  Translates and normalizes transcriptions into a unified operational language for downstream analysis.

- **Speaker Diarization**  
  Identifies *who spoke when*, even in overlapping or noisy multi-speaker environments.

- **Acoustic Event Detection**  
  Detects and classifies non-speech background sounds such as environmental noise, indoor/outdoor context, and anomalous acoustic patterns.

- **Paralinguistic Analysis**  
  Extracts non-verbal attributes including:
  - Emotional state
  - Pitch and energy variation
  - Stress indicators
  - Gender classification
  - Pause and speaking behavior analysis

---

## Reasoning & Intelligence Module

This module performs **contextual reasoning and threat interpretation** using fused audio features.

- **Offline Contextual Query Engine**  
  Allows operators to query historical or real-time audio intelligence using natural language, entirely offline.

- **Cross-feature Fusion & Correlation**  
  Combines transcription, speaker behavior, emotion, energy levels, pauses, and audio events to derive deeper situational awareness.

- **Threat Interpretation Beyond Text**  
  Identifies potentially threatening scenarios that may not be explicitly stated in speech, using paralinguistic and contextual cues.

- **Secure Local-Only Reasoning**  
  All reasoning and inference occur locally on the edge device, without external API calls or cloud services.

---

## High-Level Architecture

The architecture relies on a Private Subnet of edge devices communicating with a central secure dashboard.

**Input:** Audio feeds from connected microphones/arrays.
**Edge Processing (Jetson Orin AGX):**
- Preprocessing: Normalization and noise reduction via librosa/soundfile.
- Extraction: alm library orchestrates ASR, Diarization, and Audio classifiers.
- Reasoning: Ollama running Ministral/Transformers with PEFT/LoRA adapters fuses metadata into a prompt for the LLM.
- Output: Structured JSON results sent via secure API to the Dashboard.
- User Interface: Private portal for querying historical data and real-time alerts.

---

## Tech Stack

### Hardware
- **Edge AI Compute Platform**
  - High-performance, low-latency processing
  - Optimized for real-time inference workloads

### Software & Libraries
- **Core Backend:** Python, FastAPI, Node.js  
- **AI / ML Frameworks:** PyTorch, Hugging Face Transformers, NVIDIA NeMo  
- **Audio Engineering:** Librosa, SoundFile, Whisper (OpenAI)  
- **LLM & Optimization:** Ollama, Ministral, PEFT (Parameter-Efficient Fine-Tuning), LoRA  
- **Custom Library:** `alm` (Proprietary Audio Language Model library)  
- **Frontend:** Next.js, Tailwind CSS, Daisy UI  
- **Operating System:** Linux (Ubuntu for Jetson)

---

## Demo

https://github.com/user-attachments/assets/8316b771-be33-4ce2-b222-e94725519818

*This video demonstrates the offline capabilities of the ALM system detecting specific keywords and emotions in a noisy environment.*

---

## Output Example

ALM produces structured, machine-readable intelligence outputs:

```json
{
  "audio": {
    "sample_rate": 16000,
    "num_samples": 145245,
    "duration_s": 9.08
  },
  "transcription": {
    "original_text": "राग नेतागोंके जेग देरुज गर",
    "english_translation": "All the leaders of the state have gone to their homes.",
    "detected_language": "hi"
  },
  "diarization": {
    "num_speakers": 1,
    "segments": [
      {
        "speaker": "SPEAKER_00",
        "start": 0.36846875,
        "end": 3.00096875,
        "duration": 2.6325,
        "text": "राग नेतागोंके जेग देरुज गर"
      }
    ]
  },
  "paralinguistics": {
    "emotion": {
      "emotion": "Surprise"
    },
    "gender": {
      "gender": "male"
    },
    "pauses": {
      "num_pauses": 1,
      "pause_segments": [
        {
          "start": 0.0,
          "end": 0.32,
          "duration": 0.32
        }
      ]
    },
    "energy": {
      "mean_energy": 0.1316,
      "max_energy": 0.3048,
      "min_energy": 0.0,
      "energy_variance": 0.005853,
      "energy_db": -7.29
    }
  },
  "audio_events": {
    "events": [
      {
        "rank": 1,
        "label": "Speech",
        "class_index": 0,
        "probability": 0.9916
      },
      {
        "rank": 2,
        "label": "Inside, small room",
        "class_index": 500,
        "probability": 0.00174
      }
    ]
  }
}
```

---

## Future Scope

- **Audio-Visual Fusion**  
  Correlating audio intelligence with camera feeds for multi-modal threat understanding.

- **Predictive Threat Modeling**  
  Learning long-term behavior patterns to detect potential escalation risks.

- **Mesh-based Edge Coordination**  
  Enabling multiple edge units to collaboratively track events across zones.

- **Continuous Offline Learning**  
  Periodic local updates and adaptation without raw data exfiltration.

---
## Team
- Mohammed Afeef M - Team Lead
- Abdul Rahman Sudais M
- Divyaprakash R
- Jhai Pranesh T
- Rakkesh Karthi P
- Dhanusree K

---

## Contact
For any queries, discussion and collaboration contact :
**Email :** mohammed.afeef05@gmail.com

## Privacy, Security & Licensing

- Fully Offline System – **No Cloud Dependency**
- Designed for **Sensitive & Defence-Critical Use-Cases**
- Strict on-device processing ensures **maximum data privacy**

**License:** This project is open-sourced under the MIT License.

**Note on Source Code:** The core logic for the Audio Language Model is encapsulated in the alm custom library. Due to strict implementation privacy guidelines regarding the Ministry of Defence use-case, the backend source code for the alm library is removed from this public repository. The repository contains the architecture, frontend, and open-source model integration scripts.

---

**Audio Language Model (ALM) demonstrates how advanced surveillance intelligence can be achieved without compromising privacy, security, or operational control.**
