import 'server-only';
/**
 * Guardian Architecture (UAQS v3) - Runtime Governance
 * 
 * Acts as the nervous system for the database layer, detecting and warning
 * about inefficient queries in real-time.
 */

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export const guardian = {
  /**
   * Spies on a database query execution.
   * @param queryPromise - The promise result of sql`...`
   * @param context - Description of the query (e.g., function name)
   */
  async monitor<T extends unknown[]>(queryPromise: Promise<T>, context: string = 'Anonymous Query'): Promise<T> {
    // Only active in development to avoid spamming production logs
    // (User requested: "I want my local environment to scream at me")
    if (process.env.NODE_ENV === 'production') {
      return queryPromise;
    }

    const start = performance.now();
    let result: T;

    try {
      result = await queryPromise;
    } catch (error) {
      throw error;
    }

    const duration = performance.now() - start;
    const rowCount = result.length;

    // LAW 1: Speed Limit (100ms)
    if (duration > 100) {
      console.warn(
        `${RED}[GUARDIAN VIOLATION] Speed Limit Exceeded ${RESET}\n` +
        `   Context:  ${context}\n` +
        `   Duration: ${duration.toFixed(2)}ms (Limit: 100ms)\n` +
        `   Action:   Optimize query or add indexes.`
      );
    }

    // LAW 2: Mass Limit (100 rows)
    if (rowCount > 100) {
      console.warn(
        `${RED}[GUARDIAN VIOLATION] Mass Limit Exceeded ${RESET}\n` +
        `   Context:  ${context}\n` +
        `   Rows:     ${rowCount} (Limit: 100)\n` +
        `   Action:   Add LIMIT clause or strict pagination.`
      );
    }

    return result;
  }
};
