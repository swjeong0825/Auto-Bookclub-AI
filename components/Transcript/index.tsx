"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";
import { getReaderDesignation } from "@/lib/prompts/debate.system";
import TranscriptHeader from "./TranscriptHeader";
import DiscussionTopicBanner from "./DiscussionTopicBanner";
import PersonasIntro from "./PersonasIntro";
import TranscriptTurns from "./TranscriptTurns";
import LoadingProgress from "./LoadingProgress";
import ContinueDiscussionForm from "./ContinueDiscussionForm";
import InitialLoadingState from "./InitialLoadingState";
import { useContinueDiscussion } from "./useContinueDiscussion";

export default function Transcript() {
  const router = useRouter();
  const { meta, transcript, progress, reset, language, selectedTopic, customReaderName } = useAppStore();
  const [copied, setCopied] = useState(false);
  const { handleContinueDiscussion, isContinuing, continueProgress } = useContinueDiscussion();

  // Get reader designation: use custom name if provided, otherwise default to language-based designation
  const readerDesignation = customReaderName || getReaderDesignation(language);
  // Capitalize first letter for display (only if not custom name, as custom name should be displayed as-is)
  const readerLabel = customReaderName || 
    (readerDesignation.charAt(0).toUpperCase() + readerDesignation.slice(1));

  if (!meta) {
    return null;
  }

  if (!transcript) {
    return <InitialLoadingState meta={meta} progress={progress} />;
  }

  const copyToClipboard = () => {
    const text = formatTranscript(transcript);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatTranscript = (t: typeof transcript) => {
    let text = `Book Discussion: ${meta.title} by ${meta.author}\n\n`;
    text += `Persona A: ${t.personas[0].name} - ${t.personas[0].role}\n`;
    text += `Persona B: ${t.personas[1].name} - ${t.personas[1].role}\n\n`;
    text += "---\n\n";
    t.turns.forEach((turn) => {
      if (turn.speaker === "USER") {
        text += `${readerLabel}: ${turn.text}\n\n`;
      } else {
        const persona = turn.speaker === "A" ? t.personas[0] : t.personas[1];
        text += `${persona.name} (${turn.speaker}): ${turn.text}\n\n`;
      }
    });
    return text;
  };

  const handleNewSearch = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="discuss-container">
      <TranscriptHeader
        meta={meta}
        copied={copied}
        onNewSearch={handleNewSearch}
        onCopyTranscript={copyToClipboard}
      />

      {selectedTopic && <DiscussionTopicBanner topic={selectedTopic} />}

      <PersonasIntro personas={transcript.personas} />

      <TranscriptTurns
        turns={transcript.turns}
        personas={transcript.personas}
        readerLabel={readerLabel}
      />

      {isContinuing && continueProgress !== undefined && (
        <LoadingProgress progress={continueProgress} />
      )}

      {!isContinuing && (
        <ContinueDiscussionForm
          onSubmit={handleContinueDiscussion}
          disabled={isContinuing}
        />
      )}
    </div>
  );
}

