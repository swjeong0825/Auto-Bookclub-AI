"use client";

interface DiscussionTopicBannerProps {
  topic: string;
}

export default function DiscussionTopicBanner({ topic }: DiscussionTopicBannerProps) {
  return (
    <div className="discussion-topic-banner">
      <div className="discussion-topic-label">Discussion Topic</div>
      <div className="discussion-topic-text">{topic}</div>
    </div>
  );
}

