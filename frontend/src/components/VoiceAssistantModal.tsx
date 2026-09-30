'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, X, Send, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const {
    isVoiceOpen,
    setIsVoiceOpen,
    selectedLanguage,
    setSelectedLanguage,
    voiceTranscript,
    assistantMessage,
    isListening,
    setIsListening,
    awaitingOrderConfirmation,
    processVoiceCommand,
    speakResponse,
    isSpeechSupported
  } = useApp();

  const [textInput, setTextInput] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          processVoiceCommand(transcript);
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'aborted' || event.error === 'no-speech') {
            setIsListening(false);
            return;
          }
          console.warn('Speech recognition info:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognitionInstance(recognition);

        return () => {
          try {
            recognition.abort();
          } catch (e) {}
        };
      }
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionInstance) {
      alert('Speech Recognition is not supported by your browser. You can type commands in the text box below.');
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        recognitionInstance.lang = selectedLanguage;
        recognitionInstance.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processVoiceCommand(textInput);
    setTextInput('');
  };

  const handleChipClick = (cmdText: string) => {
    processVoiceCommand(cmdText);
  };

  if (!isVoiceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-lg">
              🎤
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Voice Assistant</h2>
              <p className="text-xs text-emerald-100">Order easily with simple voice commands</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (recognitionInstance && isListening) recognitionInstance.stop();
              setIsVoiceOpen(false);
            }}
            className="p-1 rounded-full hover:bg-emerald-700 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls Bar: Language Selector */}
        <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
          <label className="text-xs font-semibold text-emerald-900 flex items-center space-x-1">
            <span>Language:</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="bg-white border border-emerald-300 text-emerald-900 text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi (हिंदी)</option>
            <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
          </select>
        </div>

        {/* Main Assistant Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {!isSpeechSupported && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Browser speech recognition is not supported in this browser environment. You can still use the text command box below to test all voice features!
              </span>
            </div>
          )}

          {/* Large Microphone Action */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg ${
                isListening
                  ? 'bg-red-500 text-white mic-active scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>

            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              {isListening ? (
                <span className="text-red-600 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping mr-1"></span>
                  Listening... Speak now
                </span>
              ) : (
                'Click Mic & Speak'
              )}
            </span>
          </div>

          {/* User Transcript Display */}
          {voiceTranscript && (
            <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-700 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">You Said:</span>
              <p className="italic text-slate-800">"{voiceTranscript}"</p>
            </div>
          )}

          {/* Assistant Response Display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
                <span>🤖 Assistant Response:</span>
              </span>
              {assistantMessage && (
                <button
                  type="button"
                  onClick={() => speakResponse(assistantMessage)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center space-x-1"
                  title="Replay speech"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Replay</span>
                </button>
              )}
            </div>
            <p className="text-sm font-semibold text-emerald-950">{assistantMessage}</p>

            {/* Confirmation Buttons if Assistant asks Yes/No */}
            {awaitingOrderConfirmation && (
              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => processVoiceCommand('Yes')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Order (Yes)</span>
                </button>
                <button
                  type="button"
                  onClick={() => processVoiceCommand('No')}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel (No)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Example Command Chips */}
          <div>
            <span className="text-xs font-bold text-slate-600 block mb-2">Try saying or clicking:</span>
            <div className="flex flex-wrap gap-2">
              {[
                '2 kg tomatoes',
                '1 kg potatoes',
                '2 apples',
                'Show my cart',
                'Place my order'
              ].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleChipClick(cmd)}
                  className="bg-white border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs px-2.5 py-1.5 rounded-full font-medium transition"
                >
                  🎤 "{cmd}"
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Text Input Fallback Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleTextSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type command (e.g. Add 2 kg tomatoes)..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition"
              title="Send Command"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
