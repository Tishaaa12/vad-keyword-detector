import { useState, useEffect, useRef } from 'react';
import { callGeminiKeywordExtractor } from '../services/gemini';

export default function useVAD() {
  const [isActive, setIsActive] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('INACTIVE');
  const [keywords, setKeywords] = useState([]);
  const [threshold, setThreshold] = useState(15);
  const [silenceDelay, setSilenceDelay] = useState(1500);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [mouthHeight, setMouthHeight] = useState(4);
  const [speakingWord, setSpeakingWord] = useState('');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const statusRef = useRef('INACTIVE');
  const thresholdRef = useRef(15);
  const silenceDelayRef = useRef(1500);
  const isSpeechActiveRef = useRef(false);
  const silenceTimeoutIdRef = useRef(null);
  const mimeTypeRef = useRef('audio/webm');

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);
  useEffect(() => { silenceDelayRef.current = silenceDelay; }, [silenceDelay]);

  useEffect(() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
      return;
    }

    fetch('/config.json')
      .then(response => response.json())
      .then(config => {
        if (config.GEMINI_API_KEY) {
          setApiKey(config.GEMINI_API_KEY);
        } else {
          const savedKey = localStorage.getItem('GEMINI_API_KEY');
          if (savedKey) setApiKey(savedKey);
        }
      })
      .catch(() => {
        const savedKey = localStorage.getItem('GEMINI_API_KEY');
        if (savedKey) setApiKey(savedKey);
      });
  }, []);

  const detectMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/ogg')) {
      return 'audio/ogg';
    } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    }
    return 'audio/aac';
  };

  const runAudioLoop = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) {
      animationFrameRef.current = requestAnimationFrame(runAudioLoop);
      return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      analyser.getFloatTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const currentVol = Math.min(Math.round(rms * 450), 100);
      setAudioLevel(currentVol);

      if (statusRef.current === 'LISTENING') {
        const liveMouth = 4 + (currentVol / 100) * 22;
        setMouthHeight(liveMouth);
      }

      if (statusRef.current === 'IDLE' || statusRef.current === 'LISTENING') {
        if (currentVol > thresholdRef.current) {
          if (!isSpeechActiveRef.current) {
            isSpeechActiveRef.current = true;
            setStatus('LISTENING');
            recordedChunksRef.current = [];
            try {
              const mime = detectMimeType();
              mimeTypeRef.current = mime;
              mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: mime });
              mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                  recordedChunksRef.current.push(event.data);
                }
              };
              mediaRecorderRef.current.onstop = processAudioRecording;
              mediaRecorderRef.current.start(100);
            } catch (err) {
              console.error(err);
            }
          }

          if (silenceTimeoutIdRef.current) {
            clearTimeout(silenceTimeoutIdRef.current);
            silenceTimeoutIdRef.current = null;
          }
        } else {
          if (isSpeechActiveRef.current) {
            if (!silenceTimeoutIdRef.current) {
              silenceTimeoutIdRef.current = setTimeout(() => {
                isSpeechActiveRef.current = false;
                silenceTimeoutIdRef.current = null;
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  mediaRecorderRef.current.stop();
                }
              }, silenceDelayRef.current);
            }
          }
        }
      }

      ctx.clearRect(0, 0, width, height);
      
      let waveColor = 'rgba(6, 182, 212, 0.7)';
      let shadowColor = 'rgba(6, 182, 212, 0.4)';
      
      if (statusRef.current === 'LISTENING') {
        waveColor = 'rgba(16, 185, 129, 0.8)';
        shadowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (statusRef.current === 'PROCESSING') {
        waveColor = 'rgba(139, 92, 246, 0.8)';
        shadowColor = 'rgba(139, 92, 246, 0.5)';
      } else if (statusRef.current === 'SPEAKING') {
        waveColor = 'rgba(245, 158, 11, 0.8)';
        shadowColor = 'rgba(245, 158, 11, 0.5)';
      }

      const drawSine = (amplitudeFactor, frequency, offset, lineWidth, opacity) => {
        ctx.beginPath();
        ctx.strokeStyle = waveColor.replace(/[\d.]+\)$/, `${opacity})`);
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = 8;
        ctx.shadowColor = shadowColor;
        
        const dynamicAmplitude = (rms * 120 + 2) * amplitudeFactor;
        
        for (let x = 0; x < width; x++) {
          const radian = (x / width) * Math.PI * 2 * frequency + offset;
          const y = (height / 2) + Math.sin(radian) * dynamicAmplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      const time = Date.now() * 0.006;
      drawSine(0.3, 1.8, time, 1, 0.25);
      drawSine(0.6, 2.5, -time * 0.8, 1.5, 0.4);
      drawSine(1.0, 1.2, time * 0.5, 2.5, 0.85);
    };

    draw();
    animationFrameRef.current = requestAnimationFrame(runAudioLoop);
  };

  const processAudioRecording = () => {
    setStatus('PROCESSING');
    setMouthHeight(4);
    
    if (recordedChunksRef.current.length === 0) {
      setStatus('IDLE');
      return;
    }

    const audioBlob = new Blob(recordedChunksRef.current, { type: mimeTypeRef.current });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      try {
        if (!apiKey) {
          setErrorMessage("Missing Gemini API Key.");
          setStatus('IDLE');
          return;
        }
        setErrorMessage('');
        const cleanKeywords = await callGeminiKeywordExtractor(base64Data, mimeTypeRef.current, apiKey);
        if (Array.isArray(cleanKeywords) && cleanKeywords.length > 0) {
          const newItems = cleanKeywords.map(word => ({
            id: Math.random().toString(36).substr(2, 9),
            text: word.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }));
          setKeywords(prev => [...newItems, ...prev]);
          speakKeywords(cleanKeywords);
        } else {
          setStatus('IDLE');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(`Gemini Extraction failed: ${err.message}`);
        setStatus('IDLE');
      }
    };
  };

  const speakKeywords = (words) => {
    if (!('speechSynthesis' in window)) {
      setStatus('IDLE');
      return;
    }

    window.speechSynthesis.cancel();
    setStatus('SPEAKING');

    const phrase = `Detected terms: ${words.join(', ')}`;
    const utterance = new SpeechSynthesisUtterance(phrase);
    
    const voices = window.speechSynthesis.getVoices();
    const assistantVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural") || v.lang.startsWith("en-US"));
    if (assistantVoice) {
      utterance.voice = assistantVoice;
    }

    utterance.rate = 0.95;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const textSoFar = phrase.substring(0, event.charIndex + event.charLength);
        const activeWord = words.find(w => textSoFar.toLowerCase().includes(w.toLowerCase()));
        if (activeWord) {
          setSpeakingWord(activeWord);
        }
      }
    };

    utterance.onend = () => {
      setSpeakingWord('');
      setStatus('IDLE');
    };

    utterance.onerror = (e) => {
      console.error(e);
      setSpeakingWord('');
      setStatus('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let intervalId = null;
    if (status === 'SPEAKING') {
      intervalId = setInterval(() => {
        setMouthHeight(4 + Math.random() * 18);
      }, 95);
    } else if (status !== 'LISTENING') {
      setMouthHeight(4);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status]);

  const toggleSession = async () => {
    if (isActive) {
      setIsActive(false);
      setStatus('INACTIVE');
      setAudioLevel(0);
      setMouthHeight(4);
      
      if (silenceTimeoutIdRef.current) {
        clearTimeout(silenceTimeoutIdRef.current);
        silenceTimeoutIdRef.current = null;
      }
      isSpeechActiveRef.current = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } else {
      try {
        setErrorMessage('');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        setIsActive(true);
        setStatus('IDLE');
        
        runAudioLoop();
      } catch (err) {
        console.error(err);
        setErrorMessage(`Microphone access failed: ${err.message || 'Permission denied'}`);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (silenceTimeoutIdRef.current) clearTimeout(silenceTimeoutIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    isActive,
    status,
    audioLevel,
    errorMessage,
    mouthHeight,
    speakingWord,
    keywords,
    threshold,
    silenceDelay,
    setThreshold,
    setSilenceDelay,
    setKeywords,
    toggleSession
  };
}
