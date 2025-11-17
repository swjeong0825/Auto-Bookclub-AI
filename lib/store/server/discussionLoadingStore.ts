/**
 * Discussion Loading Store
 * 
 * A class-based store that can be used in server code.
 * Each API call creates a new instance, which is automatically garbage collected
 * when the API call completes and the instance goes out of scope.
 * 
 * Usage in backend:
 *   import { DiscussionLoadingState } from '@/lib/store/server/discussionLoadingStore';
 * 
 *   const loadingState = new DiscussionLoadingState();
 *   loadingState.setTotalDiscussions(12);
 *   loadingState.incrementCreatedDiscussions();
 *   const ratio = loadingState.getCompletedDiscussionRatio();
 */

export type DiscussionLoadingStateData = {
  totalDiscussions: number;
  createdDiscussions: number;
};

export class DiscussionLoadingState {
  private totalDiscussions: number = 0;
  private createdDiscussions: number = 0;

  /**
   * Set the total number of discussions to be created
   */
  setTotalDiscussions(total: number): void {
    this.totalDiscussions = total;
    this.createdDiscussions = 0;
  }

  /**
   * Increment the number of created discussions
   */
  incrementCreatedDiscussions(): void {
    this.createdDiscussions = Math.min(
      this.createdDiscussions + 1,
      this.totalDiscussions
    );
  }


  /**
   * Get the ratio of created discussions to total discussions
   */
  getCompletedDiscussionRatio(): number {
    const ratio = this.createdDiscussions / this.totalDiscussions;
    return Math.round(ratio * 10_000) / 10_000; // number with up to 4 decimal places
  }
}

